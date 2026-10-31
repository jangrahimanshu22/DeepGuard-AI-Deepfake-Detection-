import os
import argparse
from pathlib import Path
from PIL import Image

def audit_dataset(dataset_dir: str):
    """Audits deepfake dataset structure for class balance, unreadable images, and split integrity."""
    path = Path(dataset_dir)
    if not path.exists():
        print(f"Dataset directory '{dataset_dir}' does not exist.")
        return

    print(f"\n=======================================================")
    print(f"DeepGuard AI Dataset Audit: {dataset_dir}")
    print(f"=======================================================")

    splits = [d for d in path.iterdir() if d.is_dir() and d.name in ["train", "val", "test"]]
    if not splits:
        splits = [path]

    total_images = 0
    corrupt_count = 0
    stats = {}

    for split in splits:
        split_name = split.name
        stats[split_name] = {"REAL": 0, "FAKE": 0, "UNKNOWN": 0}
        
        for root, dirs, files in os.walk(split):
            for f in files:
                ext = f.lower().rsplit(".", 1)[-1] if "." in f else ""
                if ext not in ["jpg", "jpeg", "png", "webp"]:
                    continue

                total_images += 1
                file_path = os.path.join(root, f)
                
                # Check readability
                try:
                    with Image.open(file_path) as img:
                        img.verify()
                except Exception:
                    print(f"[CORRUPT] Failed to open: {file_path}")
                    corrupt_count += 1
                    continue

                parent_dir = os.path.basename(root).upper()
                if "REAL" in parent_dir or "AUTHENTIC" in parent_dir:
                    stats[split_name]["REAL"] += 1
                elif "FAKE" in parent_dir or "MANIPULATED" in parent_dir:
                    stats[split_name]["FAKE"] += 1
                else:
                    stats[split_name]["UNKNOWN"] += 1

    for s_name, counts in stats.items():
        total_split = counts["REAL"] + counts["FAKE"] + counts["UNKNOWN"]
        ratio = (counts["REAL"] / counts["FAKE"]) if counts["FAKE"] > 0 else 0
        print(f"\nSplit '{s_name}': Total = {total_split}")
        print(f"  - REAL: {counts['REAL']}")
        print(f"  - FAKE: {counts['FAKE']}")
        if counts["UNKNOWN"] > 0:
            print(f"  - UNKNOWN: {counts['UNKNOWN']}")
        print(f"  - Real/Fake Ratio: {ratio:.2f}")

    print(f"\nSummary:")
    print(f"  Total Valid Images: {total_images - corrupt_count}")
    print(f"  Corrupt Images: {corrupt_count}")
    print(f"=======================================================\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Audit deepfake dataset class balance and image integrity.")
    parser.add_argument("--dir", type=str, default="data", help="Path to dataset directory")
    args = parser.parse_args()
    audit_dataset(args.dir)
