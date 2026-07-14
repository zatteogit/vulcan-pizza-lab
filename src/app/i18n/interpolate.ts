/** Pure message interpolation shared by UI adapters and domain presenters. */
export function interpolate(
  template: string | undefined,
  vars: Record<string, string | number>,
): string {
  if (!template) return "";
  const value = template.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  );
  return value.replace(/~\s*~+/g, "~");
}
