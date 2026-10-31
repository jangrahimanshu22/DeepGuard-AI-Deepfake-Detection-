import io
import base64
import numpy as np
import torch
import cv2
from PIL import Image
from typing import List, Optional, Tuple

class ViTAttentionRollout:
    """Computes Attention Rollout by recursively multiplying multi-head self-attention matrices across ViT blocks."""

    def __init__(self, discard_ratio: float = 0.85, head_fusion: str = "mean"):
        self.discard_ratio = discard_ratio
        self.head_fusion = head_fusion

    def compute_rollout(self, attention_matrices: List[torch.Tensor]) -> Optional[np.ndarray]:
        """
        Args:
            attention_matrices: List of (B, num_heads, N, N) attention tensors from each transformer block.
        Returns:
            Normalized 2D attention mask (H, W).
        """
        if not attention_matrices:
            return None

        result = torch.eye(attention_matrices[0].size(-1))
        
        with torch.no_grad():
            for attn in attention_matrices:
                if attn is None:
                    continue
                # Average across heads
                if self.head_fusion == "mean":
                    attn_fused = attn.mean(dim=1)[0].cpu()
                elif self.head_fusion == "max":
                    attn_fused = attn.max(dim=1)[0][0].cpu()
                else:
                    attn_fused = attn.min(dim=1)[0][0].cpu()

                # Add residual identity and normalize
                I = torch.eye(attn_fused.size(-1))
                a = (attn_fused + I) / 2.0
                a = a / a.sum(dim=-1, keepdim=True)

                result = torch.matmul(a, result)

            # Mask from CLS token to all patch tokens
            mask = result[0, 1:]
            grid_size = int(np.sqrt(mask.size(0)))
            mask = mask.reshape(grid_size, grid_size).numpy()
            
            # Normalize to 0-1
            if mask.max() > mask.min():
                mask = (mask - mask.min()) / (mask.max() - mask.min())
            else:
                mask = np.zeros_like(mask)

            mask = cv2.resize(mask, (224, 224), interpolation=cv2.INTER_CUBIC)
            return mask

def generate_attention_rollout_overlay(image_pil: Image.Image, mask_np: Optional[np.ndarray]) -> Tuple[bool, str]:
    if mask_np is None:
        return False, ""

    img_rgb = np.array(image_pil.resize((224, 224)))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * mask_np), cv2.COLORMAP_MAGMA)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    overlay = cv2.addWeighted(img_rgb, 0.55, heatmap_colored, 0.45, 0)
    out_pil = Image.fromarray(overlay)

    buffer = io.BytesIO()
    out_pil.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return True, f"data:image/png;base64,{b64_str}"
