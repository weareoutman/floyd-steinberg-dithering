/**
 *
 * Floyd–Steinberg dithering is an image dithering algorithm first published in
 * 1976 by Robert W. Floyd and Louis Steinberg. It is commonly used by image
 * manipulation software, for example when an image is converted into GIF
 * format that is restricted to a maximum of 256 colors.
 */

/**
 * Use Floyd–Steinberg dithering to convert an image to specified bits grayscale.
 *
 * @param {ImageData} imageData
 * @param {number} bits
 */
function fsdGrayscale(imageData, bits = 1) {
  const width = imageData.width;
  const height = imageData.height;
  const grayscalePixels = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const pixelIndex = y * width + x;
        const index = pixelIndex * 4;
        const oldPixel = imageData.data.slice(index, index + 4);
        const luma = getLumaByRGBA(oldPixel);
        grayscalePixels.set([luma], pixelIndex);
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const pixelIndex = y * width + x;
        oldPixel = grayscalePixels[pixelIndex];
        newPixel = findClosestLuma(oldPixel, bits);
        grayscalePixels.set([newPixel], pixelIndex);

        const quantError = oldPixel - newPixel;
        if (x + 1 < width) {
            const nextIndex = pixelIndex + 1;
            const nextPixel = grayscalePixels[nextIndex];
            grayscalePixels.set([nextPixel + quantError * 7 / 16], nextIndex);
        }
        if (x - 1 >= 0 && y + 1 < height) {
            const nextIndex = pixelIndex + width - 1;
            const nextPixel = grayscalePixels[nextIndex];
            grayscalePixels.set([nextPixel + quantError * 3 / 16], nextIndex);
        }
        if (y + 1 < height) {
            const nextIndex = pixelIndex + width;
            const nextPixel = grayscalePixels[nextIndex];
            grayscalePixels.set([nextPixel + quantError * 5 / 16], nextIndex);
        }
        if (x + 1 < width && y + 1 < height) {
            const nextIndex = pixelIndex + width + 1;
            const nextPixel = grayscalePixels[nextIndex];
            grayscalePixels.set([nextPixel + quantError * 1 / 16], nextIndex);
        }
    }
  }

  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const pixelIndex = y * width + x;
        const newLuma = grayscalePixels[pixelIndex];
        pixels.set([newLuma, newLuma, newLuma, 255], pixelIndex * 4);
    }
  }
  const newImageData = new ImageData(width, height);
  newImageData.data.set(pixels);

  return newImageData;
}

/**
 * Use Floyd–Steinberg dithering to convert an image to specified bits grayscale.
 *
 * @param {ImageData} imageData
 * @param {number} bits
 */
function fsdGrayscale_v2(imageData, bits = 1) {
  const width = imageData.width;
  const height = imageData.height;
  const newImageData = new ImageData(width, height);
  newImageData.data.set(imageData.data);
  const pixels = newImageData.data;
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          const oldPixel = pixels.slice(index, index + 4);
          const luma = getLumaByRGBA(oldPixel);
          const newLuma = findClosestLuma(luma, bits);
          newPixel = [newLuma, newLuma, newLuma, 255];
          pixels.set(newPixel, index);

          const quantError = luma - newLuma;
          if (x + 1 < width) {
              const nextIndex = index + 4;
              const nextPixel = pixels.slice(nextIndex, nextIndex + 4);
              const nextLuma = getLumaByRGBA(nextPixel) + quantError * 7 / 16;
              pixels.set([nextLuma, nextLuma, nextLuma, nextPixel[3]], nextIndex);
          }
          if (x - 1 >= 0 && y + 1 < height) {
              const nextIndex = index + (width - 1) * 4;
              const nextPixel = pixels.slice(nextIndex, nextIndex + 4);
              const nextLuma = getLumaByRGBA(nextPixel) + quantError * 3 / 16;
              pixels.set([nextLuma, nextLuma, nextLuma, nextPixel[3]], nextIndex);
          }
          if (y + 1 < height) {
              const nextIndex = index + width * 4;
              const nextPixel = pixels.slice(nextIndex, nextIndex + 4);
              const nextLuma = getLumaByRGBA(nextPixel) + quantError * 5 / 16;
              pixels.set([nextLuma, nextLuma, nextLuma, nextPixel[3]], nextIndex);
          }
          if (x + 1 < width && y + 1 < height) {
              const nextIndex = index + (width + 1) * 4;
              const nextPixel = pixels.slice(nextIndex, nextIndex + 4);
              const nextLuma = getLumaByRGBA(nextPixel) + quantError * 1 / 16;
              pixels.set([nextLuma, nextLuma, nextLuma, nextPixel[3]], nextIndex);
          }
      }
  }

  return newImageData;
}

/**
 *
 * @param {number} luma Between 0 and 255
 * @returns {number}
 */
function findClosestLuma(luma, bits = 8) {
    const scale = 255 / (2 ** bits - 1);
    const value = Math.round(Math.round(luma / scale) * scale);
    return value;
}

function getLumaByRGBA(rgb) {
    const [r, g, b, a] = rgb;
    // https://en.wikipedia.org/wiki/Grayscale
    return (0.299 * r + 0.587 * g + 0.114 * b) * a / 255;
}

// https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
//
// for each y from top to bottom do
//     for each x from left to right do
//         oldpixel := pixels[x][y]
//         newpixel := find_closest_palette_color(oldpixel)
//         pixels[x][y] := newpixel
//         quant_error := oldpixel - newpixel
//         pixels[x + 1][y    ] := pixels[x + 1][y    ] + quant_error × 7 / 16
//         pixels[x - 1][y + 1] := pixels[x - 1][y + 1] + quant_error × 3 / 16
//         pixels[x    ][y + 1] := pixels[x    ][y + 1] + quant_error × 5 / 16
//         pixels[x + 1][y + 1] := pixels[x + 1][y + 1] + quant_error × 1 / 16
