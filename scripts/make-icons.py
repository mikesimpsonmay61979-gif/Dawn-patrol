#!/usr/bin/env python3
"""Draw Dawn Patrol app icons. No third-party image library."""

import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def chunk(tag: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png(path: Path, width: int, height: int, pixels: bytes) -> None:
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(pixels[y * stride : (y + 1) * stride])
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def lerp(a: float, b: float, t: float) -> int:
    return int(a + (b - a) * t)


def ridge_y(nx: float) -> float:
    base = 0.63
    y = base
    for center, height, width in (
        (0.16, 0.08, 0.18),
        (0.38, 0.15, 0.2),
        (0.62, 0.11, 0.18),
        (0.84, 0.07, 0.16),
    ):
        distance = abs(nx - center) / width
        if distance < 1:
            y = min(y, base - height * (1 - distance))
    return y


def pine(pixels: bytearray, width: int, height: int, cx: float, ground: float, size: float) -> None:
    color = (18, 42, 28, 255)
    for row in range(int(size)):
        half = int((size - row) * 0.42)
        y = int(ground - row)
        if y < 0 or y >= height:
            continue
        for x in range(int(cx) - half, int(cx) + half + 1):
            if 0 <= x < width:
                i = (y * width + x) * 4
                pixels[i : i + 4] = bytes(color)


def draw(size: int, maskable: bool) -> bytes:
    pixels = bytearray(size * size * 4)
    margin = 0.08 if maskable else 0.0
    for y in range(size):
        ny = y / (size - 1)
        for x in range(size):
            nx = x / (size - 1)
            if maskable and (nx < margin or nx > 1 - margin or ny < margin or ny > 1 - margin):
                r, g, b = 16, 26, 20
            else:
                horizon = 0.58
                if ny < horizon:
                    t = (ny / horizon) ** 0.9
                    r = lerp(18, 214, t)
                    g = lerp(42, 108, t)
                    b = lerp(62, 58, t)
                else:
                    r, g, b = 16, 28, 22
                sun_y = 0.50 * size
                sun_x = 0.50 * size
                radius = (0.115 if maskable else 0.145) * size
                dist = math.hypot(x - sun_x, y - sun_y)
                if dist < radius:
                    edge = dist / radius
                    if edge > 0.78:
                        r, g, b = 255, 186, 110
                    else:
                        r, g, b = 255, 92, 26
                ry = ridge_y(nx) * size
                if y > ry and not (dist < radius and y < sun_y + 4):
                    shade = 14 + int(6 * math.sin(nx * 20))
                    r, g, b = shade, shade + 16, shade + 8
            i = (y * size + x) * 4
            pixels[i : i + 4] = bytes((r, g, b, 255))
    if not maskable:
        pine(pixels, size, size, 0.22 * size, ridge_y(0.22) * size, 0.16 * size)
        pine(pixels, size, size, 0.72 * size, ridge_y(0.72) * size + 2, 0.2 * size)
    return bytes(pixels)


def main() -> None:
    public = ROOT / "public" / "icons"
    app = ROOT / "src" / "app"
    write_png(public / "icon-192.png", 192, 192, draw(192, False))
    write_png(public / "icon-512.png", 512, 512, draw(512, False))
    write_png(public / "icon-maskable-512.png", 512, 512, draw(512, True))
    write_png(public / "apple-touch-icon.png", 180, 180, draw(180, False))
    write_png(app / "icon.png", 512, 512, draw(512, False))
    write_png(app / "apple-icon.png", 180, 180, draw(180, False))


if __name__ == "__main__":
    main()
