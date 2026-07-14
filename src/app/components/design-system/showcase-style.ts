/**
 * Converts a dynamic React style value into a CSS custom-property value.
 *
 * React appends `px` to numeric values for dimensional properties, but it does
 * not do that for custom properties. The showcase style migration uses this
 * helper at the narrow JS -> CSS boundary so generated classes preserve the
 * original rendering without retaining visual declarations in JSX.
 */
export function toShowcaseCssValue(
  value: unknown,
  unitless = false,
): string | number | undefined {
  if (value == null || typeof value === "boolean") return undefined;
  if (typeof value === "number") return unitless ? value : `${value}px`;
  return String(value);
}
