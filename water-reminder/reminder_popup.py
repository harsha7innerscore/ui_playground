#!/usr/bin/env python3
"""Shows a small animated toast in the bottom-left corner for 5s, reminding to drink water."""
import os
import tkinter as tk

from PIL import Image, ImageTk

ASSET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
PANEL_PATHS = [os.path.join(ASSET_DIR, f"panel_{i}.png") for i in range(1, 7)]
TOTAL_MS = 5000
TARGET_HEIGHT = 220
SCREEN_MARGIN = 24


class WaterToast:
    def __init__(self, root):
        self.root = root
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)

        panels = [Image.open(p).convert("RGB") for p in PANEL_PATHS]
        max_w = 0
        resized = []
        for im in panels:
            scale = TARGET_HEIGHT / im.height
            im = im.resize((int(im.width * scale), TARGET_HEIGHT), Image.LANCZOS)
            resized.append(im)
            max_w = max(max_w, im.width)

        self.frames = []
        for im in resized:
            canvas = Image.new("RGB", (max_w, TARGET_HEIGHT), (17, 17, 17))
            canvas.paste(im, ((max_w - im.width) // 2, 0))
            self.frames.append(ImageTk.PhotoImage(canvas))
        self.duration_per_frame = TOTAL_MS // len(self.frames)

        frame = tk.Frame(root, bg="#111111", highlightbackground="#2fa8ff", highlightthickness=2)
        frame.pack()

        self.label = tk.Label(frame, bg="#111111")
        self.label.pack()

        self._place_bottom_left(max_w, TARGET_HEIGHT)
        self._animate(0)
        self.root.after(TOTAL_MS, self._safe_destroy)
        self.root.bind("<Button-1>", lambda e: self.root.destroy())

    def _place_bottom_left(self, w, h):
        self.root.update_idletasks()
        sh = self.root.winfo_screenheight()
        x = SCREEN_MARGIN
        y = sh - h - SCREEN_MARGIN - 4
        self.root.geometry(f"{w}x{h}+{x}+{y}")

    def _animate(self, idx):
        if not self.root.winfo_exists():
            return
        self.label.configure(image=self.frames[idx])
        next_idx = (idx + 1) % len(self.frames)
        self.root.after(self.duration_per_frame, self._animate, next_idx)

    def _safe_destroy(self):
        if self.root.winfo_exists():
            self.root.destroy()


def main():
    root = tk.Tk()
    WaterToast(root)
    root.mainloop()


if __name__ == "__main__":
    main()
