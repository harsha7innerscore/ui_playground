#!/usr/bin/env python3
"""Pops an always-on-top window reminding you to drink water, with an animated GIF."""
import os
import tkinter as tk

from PIL import Image, ImageTk

ASSET_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
PANEL_PATHS = [os.path.join(ASSET_DIR, f"panel_{i}.png") for i in range(1, 7)]
DURATIONS_MS = [1100, 900, 1100, 900, 1300, 1600]
AUTO_CLOSE_MS = 60_000
TARGET_HEIGHT = 480


class WaterReminder:
    def __init__(self, root):
        self.root = root
        self.root.title("Water break")
        self.root.attributes("-topmost", True)
        self.root.resizable(False, False)

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
        self.durations = DURATIONS_MS

        w, h = max_w, TARGET_HEIGHT
        frame = tk.Frame(root, bg="#111111", padx=18, pady=18)
        frame.pack()

        self.label = tk.Label(frame, bg="#111111")
        self.label.pack()

        tk.Label(
            frame,
            text="Time for a water break 💧",
            fg="white",
            bg="#111111",
            font=("Helvetica", 15, "bold"),
        ).pack(pady=(12, 10))

        btn = tk.Button(
            frame,
            text="Got it, drinking now",
            command=self.root.destroy,
            font=("Helvetica", 12),
            padx=10,
            pady=4,
        )
        btn.pack()

        self._center(w + 80, h + 140)
        self._animate(0)
        self.root.after(AUTO_CLOSE_MS, self._safe_destroy)
        self.root.bind("<Escape>", lambda e: self.root.destroy())

    def _center(self, w, h):
        self.root.update_idletasks()
        sw, sh = self.root.winfo_screenwidth(), self.root.winfo_screenheight()
        x, y = (sw - w) // 2, (sh - h) // 2
        self.root.geometry(f"{w}x{h}+{x}+{y}")

    def _animate(self, idx):
        if not self.root.winfo_exists():
            return
        frame = self.frames[idx]
        self.label.configure(image=frame)
        next_idx = (idx + 1) % len(self.frames)
        self.root.after(self.durations[idx], self._animate, next_idx)

    def _safe_destroy(self):
        if self.root.winfo_exists():
            self.root.destroy()


def main():
    root = tk.Tk()
    WaterReminder(root)
    root.mainloop()


if __name__ == "__main__":
    main()
