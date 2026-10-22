import { describe, expect, it } from "vitest";
import { STYLE_PHOTOS } from "../../data/style-photos";
import { SIGNATURE_RECIPES } from "../../data/signature-recipes";
import { getToppingThumbnail, TOPPING_LIBRARY } from "../../data/topping-library";
import { getResponsiveImage, responsiveImgAttributes } from "./responsive-images";
import { RESPONSIVE_IMAGE_ENTRIES } from "./responsive-images.generated";

describe("immagini responsive (BUN-1)", () => {
  it("ogni foto locale usata dall'app ha la variante 640 e le dimensioni", () => {
    const photos = [
      ...Object.values(STYLE_PHOTOS),
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
      expect(info!.srcSet, photo).toMatch(/-640\.webp 640w, .+ \d+w$/);
    }
  });

  it("nessun ingrandimento: larghezza massima 1280, variante 640", () => {
    for (const [, , width, height, smallWidth, smallHeight] of RESPONSIVE_IMAGE_ENTRIES) {
      expect(width).toBeLessThanOrEqual(1280);
      expect(width).toBeGreaterThan(640);
      expect(smallWidth).toBe(640);
      expect(Math.abs(width / height - smallWidth / smallHeight)).toBeLessThan(0.01);
    }
  });

  it("gli URL esterni o del CMS passano invariati", () => {
    expect(getResponsiveImage("https://images.unsplash.com/photo.jpg")).toBeUndefined();
    expect(getResponsiveImage(undefined)).toBeUndefined();
    expect(responsiveImgAttributes("https://example.com/x.jpg", "96px")).toEqual({});
  });
});
