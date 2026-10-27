export type ShareResult = "opened" | "cancelled" | "unavailable";

/** Called directly from a user gesture. A resolved share is an OS handoff,
 * never evidence that a message was sent or delivered. */
export async function shareRecipeLink(url: string, title: string): Promise<ShareResult> {
  try {
    if (typeof navigator.share !== "function") return "unavailable";
    const data = { url, title };
    if (navigator.canShare && !navigator.canShare(data)) return "unavailable";
    await navigator.share(data);
    return "opened";
  } catch (error) {
    return (error as { name?: string })?.name === "AbortError" ? "cancelled" : "unavailable";
  }
}

/** No silent execCommand fallback: rejected or unavailable clipboard access
 * leaves the visible URL available for manual selection and copying. */
export async function copyRecipeLink(url: string): Promise<boolean> {
  try {
    if (typeof navigator.clipboard?.writeText !== "function") return false;
    await navigator.clipboard.writeText(url);
    return true;
  } catch { return false; }
}
