// Minimal kind-2 raster writer. Uninterpreted header fields remain zero.
// A single literal block avoids relying on undocumented run encoding details.
export function encodeEV(width, height, pixels) {
  if (!Number.isInteger(width) || width < 1 || width > 320 ||
      !Number.isInteger(height) || height < 1 || height > 200 ||
      !(pixels instanceof Uint8Array) || pixels.length !== width * height ||
      pixels.some(index => index > 3)) throw new Error('Expected a 1–320 × 1–200 raster of four pixel indices.');
  const stride = Math.ceil(width / 4), bitmap = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    bitmap[y * stride + (x >> 2)] |= pixels[y * width + x] << (6 - 2 * (x & 3));
  }
  const count = [bitmap.length % 127, ...Array(Math.floor(bitmap.length / 127)).fill(255)];
  const end = 54 + bitmap.length + count.length;
  const result = new Uint8Array(end + 5), view = new DataView(result.buffer);
  view.setUint16(0, 2, true);
  view.setUint16(2, end - 51 + 5, true);
  view.setUint16(50, end - 51, true);
  view.setUint16(52, height, true);
  result.set(bitmap, 54); result.set(count, 54 + bitmap.length);
  view.setUint16(end, width * 2, true);
  view.setUint16(end + 2, bitmap.length + 3, true);
  result[end + 4] = 26;
  return result;
}
