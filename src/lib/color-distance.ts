function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const v = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean
  const n = parseInt(v, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function srgbToLinear(c: number) {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)
  // sRGB -> XYZ (D65)
  const x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750
  const z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041
  // normalize to D65 white
  const xn = x / 0.95047
  const yn = y / 1.0
  const zn = z / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(xn)
  const fy = f(yn)
  const fz = f(zn)
  const L = 116 * fy - 16
  const a = 500 * (fx - fy)
  const bb = 200 * (fy - fz)
  return [L, a, bb]
}

export function colorDistance(hexA: string, hexB: string): number {
  const [r1, g1, b1] = hexToRgb(hexA)
  const [r2, g2, b2] = hexToRgb(hexB)
  const [L1, a1, b1L] = rgbToLab(r1, g1, b1)
  const [L2, a2, b2L] = rgbToLab(r2, g2, b2)
  const dL = L1 - L2
  const da = a1 - a2
  const db = b1L - b2L
  return Math.sqrt(dL * dL + da * da + db * db)
}
