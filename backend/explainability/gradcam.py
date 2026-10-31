import io
import base64
import numpy as np
import torch
import torch.nn.functional as F
import cv2
from PIL import Image
from typing import Optional, Tuple

class ViTGradCAM:
    """Computes gradient-weighted class activation mapping (Grad-CAM) on Vision Transformer models."""

    def __init__(self, model, target_layer=None):
        self.model = model
        self.target_layer = target_layer or getattr(model, "norm", None)
        self.gradients = None
        self.activations = None
        self.hooks = []
        self._register_hooks()

    def _register_hooks(self):
        if self.target_layer is None:
            return

        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()

        self.hooks.append(self.target_layer.register_forward_hook(forward_hook))
        self.hooks.append(self.target_layer.register_full_backward_hook(backward_hook))

    def generate_heatmap(self, input_tensor: torch.Tensor, target_class_idx: int) -> Optional[np.ndarray]:
        """
        Calculates Grad-CAM activation map.
        Returns normalized 2D numpy array [0, 1] of size (H, W).
        """
        try:
            self.model.zero_grad()
            # Ensure gradients are enabled for Grad-CAM
            input_tensor.requires_grad_(True)
            for p in self.model.parameters():
                p.requires_grad_(True)

            outputs = self.model(input_tensor)
            logits = outputs.logits if hasattr(outputs, "logits") else outputs
            score = logits[0, target_class_idx]
            score.backward(retain_graph=True)

            if self.gradients is None or self.activations is None:
                return None

            # ViT token activations: shape (B, N, C) where N = 1 + num_patches (196)
            grads = self.gradients[0, 1:]  # (196, C)
            acts = self.activations[0, 1:]  # (196, C)

            weights = grads.mean(dim=0)  # (C,)
            cam = (acts * weights).sum(dim=-1)  # (196,)
            cam = F.relu(cam)

            # Reshape to 14x14 patch grid
            grid_size = int(np.sqrt(cam.shape[0]))
            cam = cam.reshape(grid_size, grid_size).cpu().numpy()

            # Normalize to 0-1
            if cam.max() > cam.min():
                cam = (cam - cam.min()) / (cam.max() - cam.min())
            else:
                cam = np.zeros_like(cam)

            # Resize to input dimensions (224, 224)
            cam = cv2.resize(cam, (224, 224), interpolation=cv2.INTER_CUBIC)
            return cam
        except Exception:
            return None

    def remove_hooks(self):
        for h in self.hooks:
            h.remove()
        self.hooks = []

def generate_gradcam_overlay(image_pil: Image.Image, heatmap_np: Optional[np.ndarray]) -> Tuple[bool, str]:
    """
    Overlays 2D Grad-CAM heatmap onto RGB image.
    Returns (success: bool, base64_png_data_url: str).
    """
    if heatmap_np is None:
        return False, ""

    img_rgb = np.array(image_pil.resize((224, 224)))
    heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap_np), cv2.COLORMAP_JET)
    heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)

    overlay = cv2.addWeighted(img_rgb, 0.6, heatmap_colored, 0.4, 0)
    out_pil = Image.fromarray(overlay)

    buffer = io.BytesIO()
    out_pil.save(buffer, format="PNG")
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return True, f"data:image/png;base64,{b64_str}"
