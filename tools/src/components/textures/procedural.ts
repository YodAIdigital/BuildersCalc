import { DataTexture, RedFormat, RGBAFormat, RGBFormat, UVMapping, UnsignedByteType, LinearFilter, RepeatWrapping, Color } from 'three';

// Create a grayscale stripe bump texture (one tile) that will be repeated by setting texture.repeat
// Stripes run along the U axis (x) of the texture; rotate the texture 90deg to get vertical stripes.
export function makeStripeBumpTexture(size = 256, softness = 0.2): DataTexture {
  const w = size;
  const h = size;
  const data = new Uint8Array(w * h);
  const stripeWidth = 0.5; // fraction of U occupied by ridge
  const edgeSoft = Math.max(0, Math.min(0.49, softness));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w; // 0..1
      // A single ridge per tile: center at 0.5
      const d = Math.abs(u - 0.5);
      let v = 0;
      if (d <= stripeWidth * 0.5 - edgeSoft) {
        v = 255; // ridge plateau
      } else if (d <= stripeWidth * 0.5) {
        // smooth edge falloff
        const t = 1 - (d - (stripeWidth * 0.5 - edgeSoft)) / edgeSoft; // 0..1
        v = Math.round(255 * t);
      } else {
        v = 0; // valley
      }
      data[y * w + x] = v;
    }
  }
  const tex = new DataTexture(data, w, h, RedFormat, UnsignedByteType);
  tex.needsUpdate = true;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  return tex;
}

// Simple solid albedo texture if you ever need to feed a map (rarely needed since material.color is enough)
export function makeSolidAlbedoTexture(hex = '#ffffff', size = 4): DataTexture {
  const w = size;
  const h = size;
  const data = new Uint8Array(w * h * 4);
  const c = new Color(hex);
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  for (let i = 0; i < w * h; i++) {
    data[i * 4 + 0] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  const tex = new DataTexture(data, w, h, RGBAFormat, UnsignedByteType, UVMapping);
  tex.needsUpdate = true;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
return tex;
}

// Simple procedural wood-like albedo (subtle variation, no normals)
export function makeWoodAlbedoTexture(size = 256, baseHex = '#d6b98b'): DataTexture {
  const w = size;
  const h = size;
  const data = new Uint8Array(w * h * 4);
  const base = new Color(baseHex);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const v = y / h;
      // low frequency bands + tiny noise
      const band = 0.04 * Math.sin(6.283 * (u * 2 + 0.3 * Math.sin(v * 3.14)))
                 + 0.03 * Math.sin(6.283 * (v * 1.5 + 0.2 * Math.sin(u * 6.283)));
      const n = (Math.random() - 0.5) * 0.015; // tiny speckle
      const t = Math.min(1, Math.max(0, 0.6 + band + n));
      const r = Math.round((base.r * 0.7 + 0.3) * 255 * t);
      const g = Math.round((base.g * 0.7 + 0.3) * 255 * t);
      const b = Math.round((base.b * 0.7 + 0.3) * 255 * t);
      const idx = (y * w + x) * 4;
      data[idx + 0] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  const tex = new DataTexture(data, w, h, RGBAFormat, UnsignedByteType, UVMapping);
  tex.needsUpdate = true;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  return tex;
}

// Create a tangent-space normal map consisting of vertical (U-axis) stripes.
// amplitude controls normal tilt; 0..1 is recommended.
export function makeStripeNormalTexture(size = 256, stripeWidth = 0.5, edgeSoft = 0.2, amplitude = 1): DataTexture {
  const w = size;
  const h = size;
  const data = new Uint8Array(w * h * 4);

  function heightAt(u: number): number {
    // single ridge centered at 0.5; smoothstep edges
    const d = Math.abs(u - 0.5);
    const half = Math.max(0.001, stripeWidth * 0.5);
    const edge = Math.min(half, Math.max(0.0, edgeSoft));
    if (d <= half - edge) return 1.0;
    if (d <= half) {
      const t = 1 - (d - (half - edge)) / edge; // 0..1
      return t * t * (3 - 2 * t); // smoothstep
    }
    return 0.0;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const u1 = (x + 1) / w;
      const h0 = heightAt(u);
      const h1 = heightAt(u1);
      const dhdu = (h1 - h0) * amplitude; // derivative along U
      // Tangent-space normal ~ [-dh/du, 0, 1], normalize, map to 0..1
      let nx = -dhdu;
      let ny = 0;
      let nz = 1;
      const len = Math.max(1e-6, Math.hypot(nx, ny, nz));
      nx /= len; ny /= len; nz /= len;
      const r = Math.round((nx * 0.5 + 0.5) * 255);
      const g = Math.round((ny * 0.5 + 0.5) * 255);
      const b = Math.round((nz * 0.5 + 0.5) * 255);
      const idx = (y * w + x) * 4;
      data[idx + 0] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  const tex = new DataTexture(data, w, h, RGBAFormat, UnsignedByteType);
  tex.needsUpdate = true;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  return tex;
}
