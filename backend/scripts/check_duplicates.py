import os
import hashlib
import argparse
from pathlib import Path
from collections import defaultdict

def calculate_md5(file_path: str) -> str:
    hasher = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

def find_duplicates(dataset_dir: str):
    """Detects exact duplicate images within or across dataset splits (train/val/test)."""
    path = Path(dataset_dir)
    if not path.exists():
        print(f"Directory '{dataset_dir}' does not exist.")
        return

    print(f"\nScanning for duplicate files across {dataset_dir}...")
    hash_map = defaultdict(list)
    total_scanned = 0

    for root, _, files in os.walk(path):
        for f in files:
            ext = f.lower().rsplit(".", 1)[-1] if "." in f else ""
            if ext in ["jpg", "jpeg", "png", "webp"]:
                fp = os.path.join(root, f)
                file_hash = calculate_md5(fp)
                hash_map[file_hash].append(fp)
                total_scanned += 1

    duplicates = {h: paths for h, paths in hash_map.items() if len(paths) > 1}

    print(f"Scanned {total_scanned} images.")
    if not duplicates:
        print("✓ No duplicate images found. Zero cross-split leakage.")
    else:
        print(f"⚠️ Found {len(duplicates)} duplicate image sets:")
        for h, paths in list(duplicates.items())[:10]:
            print(f"\nMD5: {h}")
            for p in paths:
                print(f"  - {p}")
        if len(duplicates) > 10:
            print(f"\n... and {len(duplicates) - 10} more duplicate sets.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Find duplicate images to prevent data leakage.")
    parser.add_argument("--dir", type=str, default="data", help="Path to dataset directory")
    args = parser.parse_args()
    find_duplicates(args.dir)
