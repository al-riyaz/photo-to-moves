export type RGB = [number, number, number];
export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export const FACE_ORDER: Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

export function averageColor(data: Uint8ClampedArray): RGB {
  let r = 0, g = 0, b = 0;
  const total = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return [Math.round(r / total), Math.round(g / total), Math.round(b / total)];
}

export function rgbDistance(a: RGB, b: RGB): number {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function rgbToHsv([r, g, b]: RGB): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h, s, v];
}

/**
 * Classify a sticker color into one of the 6 cube face letters using HSV.
 * Robust to lighting variations: uses value/saturation to detect white,
 * hue ranges for chromatic colors.
 */
export function classifyStickerColor(rgb: RGB): Face {
  const [h, s, v] = rgbToHsv(rgb);
  // White: low saturation, high value
  if (s < 0.25 && v > 0.55) return 'U';
  // Very dark / unlit fallback — treat as closest by hue anyway
  // Yellow: ~40-70
  if (h >= 40 && h < 70) return 'D';
  // Orange: ~10-40
  if (h >= 10 && h < 40) return 'L';
  // Red: 0-10 or 340-360
  if (h < 10 || h >= 340) return 'R';
  // Green: 70-170
  if (h >= 70 && h < 170) return 'F';
  // Blue: 170-260
  if (h >= 170 && h < 260) return 'B';
  // Magenta-ish → likely red under cool light
  return 'R';
}

export function rotateGrid<T>(cells: T[], times: number): T[] {
  // Rotate 3x3 grid clockwise 'times' times
  const t = ((times % 4) + 4) % 4;
  let grid = [...cells];
  for (let k = 0; k < t; k++) {
    grid = [
      grid[6], grid[3], grid[0],
      grid[7], grid[4], grid[1],
      grid[8], grid[5], grid[2],
    ];
  }
  return grid;
}

export function sample3x3Averages(img: HTMLImageElement): Promise<RGB[]> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

    const maxDim = 768;
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const cellW = Math.floor(w / 3);
    const cellH = Math.floor(h / 3);
    const padX = Math.floor(cellW * 0.15);
    const padY = Math.floor(cellH * 0.15);

    const rgbs: RGB[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = col * cellW + padX;
        const y = row * cellH + padY;
        const sw = Math.max(1, cellW - padX * 2);
        const sh = Math.max(1, cellH - padY * 2);
        const imgData = ctx.getImageData(x, y, sw, sh);
        rgbs.push(averageColor(imgData.data));
      }
    }
    resolve(rgbs);
  });
}
