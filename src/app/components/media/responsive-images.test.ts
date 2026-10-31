import { describe, expect, it } from "vitest";
import { STYLE_PHOTOS } from "../../data/style-photos";
import { SIGNATURE_RECIPES } from "../../data/signature-recipes";
import { getToppingThumbnail, TOPPING_LIBRARY } from "../../data/topping-library";
import { MEDIA_SOURCE_SLOTS } from "../../data/media-source-map";
import { getResponsiveImage, IMAGE_SIZES, responsiveImgAttributes } from "./responsive-images";
import { RESPONSIVE_IMAGE_ENTRIES } from "./responsive-images.generated";

describe("immagini responsive (BUN-1)", () => {
  it("ogni foto locale usata dall'app ha la variante piccola e le dimensioni", () => {
    const photos = [
      // B2: "placeholder" è il segnaposto di ImageWithFallback, non un file.
      ...Object.values(STYLE_PHOTOS).filter((photo) => photo !== "placeholder"),
      ...SIGNATURE_RECIPES.map((recipe) => recipe.photo).filter((photo): photo is string => Boolean(photo)),
      ...Object.values(TOPPING_LIBRARY)
        .map((recipe) => getToppingThumbnail(recipe))
        .filter((thumbnail): thumbnail is string => Boolean(thumbnail)),
    ];
    expect(photos.length).toBeGreaterThan(50);
    for (const photo of new Set(photos)) {
      expect(photo, photo).toMatch(/\.webp$/);
      const info = getResponsiveImage(photo);
      expect(info, photo).toBeDefined();
      expect(info!.srcSet, photo).toMatch(/-(\d+)\.webp \1w, .+ \d+w$/);
    }
  });

  it("nessun ingrandimento: larghezza massima 1280, variante 640 (320 per i condimenti)", () => {
    for (const [src, small, width, height, smallWidth, smallHeight] of RESPONSIVE_IMAGE_ENTRIES) {
      /* I condimenti si vedono piccoli solo come miniature (40–48 px CSS):
         320 px bastano anche a `sizes` 96px a 3x. Le foto di riserva delle
         schede CMS restano byte per byte come nell'archivio (640). */
      const thumbOnly = /\/toppings\//.test(src) && !MEDIA_SOURCE_SLOTS.has(src);
      expect(smallWidth, src).toBe(thumbOnly ? 320 : 640);
      expect(small, src).toMatch(new RegExp(`-${smallWidth}\\.webp$`));
      expect(width).toBeLessThanOrEqual(1280);
      expect(width).toBeGreaterThan(smallWidth);
      expect(Math.abs(width / height - smallWidth / smallHeight)).toBeLessThan(0.01);
    }
    expect(Number(IMAGE_SIZES.thumb.match(/(\d+)px/)![1]) * 3).toBeLessThanOrEqual(320);
  });

  it("gli URL esterni o del CMS passano invariati", () => {
    expect(getResponsiveImage("https://images.unsplash.com/photo.jpg")).toBeUndefined();
    expect(getResponsiveImage(undefined)).toBeUndefined();
    expect(responsiveImgAttributes("https://example.com/x.jpg", "96px")).toEqual({});
  });
});
