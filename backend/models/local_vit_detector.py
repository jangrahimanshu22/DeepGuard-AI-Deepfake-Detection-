import os
import math
import logging
from typing import Dict, Any, List, Tuple, Optional
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image

from backend.models.base_detector import BaseDetector
from backend.utils.label_mapping import resolve_model_label_mapping, normalize_probabilities

logger = logging.getLogger(__name__)

class PatchEmbed(nn.Module):
    """2D Image to Patch Embedding."""
    def __init__(self, img_size: int = 224, patch_size: int = 16, in_chans: int = 3, embed_dim: int = 768):
        super().__init__()
        self.img_size = img_size
        self.patch_size = patch_size
        self.num_patches = (img_size // patch_size) * (img_size // patch_size)
        self.proj = nn.Conv2d(in_chans, embed_dim, kernel_size=patch_size, stride=patch_size)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.proj(x)  # (B, embed_dim, H/P, W/P)
        x = x.flatten(2).transpose(1, 2)  # (B, num_patches, embed_dim)
        return x

class Attention(nn.Module):
    """Multi-head Self Attention with explicit attention weights exposure."""
    def __init__(self, dim: int = 768, num_heads: int = 12, qkv_bias: bool = True):
        super().__init__()
        self.num_heads = num_heads
        self.head_dim = dim // num_heads
        self.scale = self.head_dim ** -0.5

        self.qkv = nn.Linear(dim, dim * 3, bias=qkv_bias)
        self.proj = nn.Linear(dim, dim)
        self.last_attn_weights: Optional[torch.Tensor] = None

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, N, C = x.shape
        qkv = self.qkv(x).reshape(B, N, 3, self.num_heads, self.head_dim).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]

        attn = (q @ k.transpose(-2, -1)) * self.scale
        attn = attn.softmax(dim=-1)
        self.last_attn_weights = attn.detach()  # Cache for Attention Rollout / XAI

        out = (attn @ v).transpose(1, 2).reshape(B, N, C)
        out = self.proj(out)
        return out

class TransformerBlock(nn.Module):
    def __init__(self, dim: int = 768, num_heads: int = 12, mlp_ratio: float = 4.0):
        super().__init__()
        self.norm1 = nn.LayerNorm(dim)
        self.attn = Attention(dim, num_heads=num_heads)
        self.norm2 = nn.LayerNorm(dim)
        mlp_hidden_dim = int(dim * mlp_ratio)
        self.mlp = nn.Sequential(
            nn.Linear(dim, mlp_hidden_dim),
            nn.GELU(),
            nn.Linear(mlp_hidden_dim, dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x + self.attn(self.norm1(x))
        x = x + self.mlp(self.norm2(x))
        return x

class VisionTransformer(nn.Module):
    """Standard ViT-B/16 Deepfake Classification Model."""
    def __init__(self, img_size: int = 224, patch_size: int = 16, in_chans: int = 3, num_classes: int = 2, embed_dim: int = 768, depth: int = 12, num_heads: int = 12):
        super().__init__()
        self.num_classes = num_classes
        self.embed_dim = embed_dim
        self.patch_embed = PatchEmbed(img_size, patch_size, in_chans, embed_dim)
        num_patches = self.patch_embed.num_patches

        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.pos_embed = nn.Parameter(torch.zeros(1, num_patches + 1, embed_dim))
        
        self.blocks = nn.ModuleList([
            TransformerBlock(embed_dim, num_heads) for _ in range(depth)
        ])
        self.norm = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, num_classes)
        
        # Init weights
        nn.init.trunc_normal_(self.pos_embed, std=0.02)
        nn.init.trunc_normal_(self.cls_token, std=0.02)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B = x.shape[0]
        x = self.patch_embed(x)
        cls_tokens = self.cls_token.expand(B, -1, -1)
        x = torch.cat((cls_tokens, x), dim=1)
        x = x + self.pos_embed

        for blk in self.blocks:
            x = blk(x)

        x = self.norm(x)
        logits = self.head(x[:, 0])
        return logits

class LocalViTDetector(BaseDetector):
    """Local PyTorch Vision Transformer Detector implementation."""

    def __init__(self, checkpoint_path: str = "checkpoints/best_vit_model.pth", device: str = "cpu"):
        super().__init__(model_name="ViT-B/16-Local", device=device)
        self.checkpoint_path = checkpoint_path
        self.model: Optional[VisionTransformer] = None
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        # Default local ViT label mapping: 0 -> REAL, 1 -> FAKE
        self.label_mapping = {"REAL": 0, "FAKE": 1}

    def load_model(self) -> None:
        logger.info(f"Initializing Local Vision Transformer architecture on device: {self.device}")
        self.model = VisionTransformer(img_size=224, patch_size=16, num_classes=2, embed_dim=768, depth=12, num_heads=12)
        
        if os.path.exists(self.checkpoint_path):
            logger.info(f"Loading local checkpoint from: {self.checkpoint_path}")
            try:
                state_dict = torch.load(self.checkpoint_path, map_location="cpu")
                if "state_dict" in state_dict:
                    state_dict = state_dict["state_dict"]
                self.model.load_state_dict(state_dict, strict=False)
                logger.info("Local checkpoint loaded successfully.")
            except Exception as e:
                logger.warning(f"Could not load checkpoint '{self.checkpoint_path}': {e}. Using base initialization.")
        else:
            logger.info(f"No local checkpoint found at '{self.checkpoint_path}'. Initialized base ViT architecture.")

        self.model.to(self.device)
        self.model.eval()
        self.is_loaded = True

    def predict_image(self, image_input: Image.Image) -> Tuple[str, float, Dict[str, float]]:
        if not self.is_loaded or self.model is None:
            self.load_model()

        tensor = self.transform(image_input).unsqueeze(0).to(self.device)
        with torch.inference_mode():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=-1)[0].cpu().tolist()

        return normalize_probabilities(probs, self.label_mapping)

    def predict_batch(self, images: List[Image.Image]) -> List[Tuple[str, float, Dict[str, float]]]:
        if not images:
            return []
        if not self.is_loaded or self.model is None:
            self.load_model()

        tensors = torch.stack([self.transform(img) for img in images]).to(self.device)
        with torch.inference_mode():
            logits = self.model(tensors)
            probs = torch.softmax(logits, dim=-1).cpu().tolist()

        return [normalize_probabilities(p, self.label_mapping) for p in probs]

    def get_model_info(self) -> Dict[str, Any]:
        param_count = sum(p.numel() for p in self.model.parameters()) if self.model else 86_000_000
        return {
            "name": self.model_name,
            "provider": "local",
            "architecture": "Vision Transformer (ViT-Base, 16x16 patch resolution)",
            "framework": "PyTorch v2.3 / Native ViT",
            "parameters": param_count,
            "input_size": "224x224",
            "label_mapping": self.label_mapping,
            "checkpoint_path": self.checkpoint_path,
            "device": self.device,
        }
