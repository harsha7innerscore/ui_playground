#!/usr/bin/env python3
"""Crops a comic panel and flood-fills its flat background to transparent,
producing a clean sprite (no caption text, no background) for the Electron app."""
import sys
from collections import deque

import numpy as np
from PIL import Image

BRIGHT_THRESHOLD = 150  # min(R,G,B) above this = background candidate (art has a
# pale gradient background vs. a near-black jacket/hair, so brightness alone
# separates them far better than distance to one sampled background color)


def remove_background(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGB"), dtype=np.int16)
    h, w, _ = arr.shape

    brightness = arr.min(axis=2)
    dist = BRIGHT_THRESHOLD - brightness  # >0 means darker than the cutoff
    is_bg_color = brightness > BRIGHT_THRESHOLD

    bg_mask = np.zeros((h, w), dtype=bool)
    visited = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if is_bg_color[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if is_bg_color[y, x] and not visited[y, x]:
                visited[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        bg_mask[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg_color[ny, nx]:
                visited[ny, nx] = True
                q.append((ny, nx))

    # feather: pixels just outside the flood-filled background, still close in
    # color, get partial alpha instead of a hard edge (kills the light fringe
    # left by anti-aliasing in the original art)
    FEATHER = 25
    dilated = bg_mask.copy()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        shifted = np.roll(bg_mask, (dy, dx), axis=(0, 1))
        dilated |= shifted
    fringe = dilated & ~bg_mask
    feather_alpha = np.clip(dist / FEATHER, 0, 1) * 255

    alpha = np.where(bg_mask, 0, np.where(fringe, feather_alpha, 255)).astype(np.uint8)
    rgba = np.dstack([np.array(img.convert("RGB")), alpha]).astype(np.uint8)
    out = Image.fromarray(rgba)
    return out


def main():
    src, out_path = sys.argv[1], sys.argv[2]
    bottom_crop = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    im = Image.open(src).convert("RGB")
    if bottom_crop:
        im = im.crop((0, 0, im.width, im.height - bottom_crop))
    sprite = remove_background(im)
    sprite.save(out_path)
    print("saved", out_path, sprite.size)


if __name__ == "__main__":
    main()
