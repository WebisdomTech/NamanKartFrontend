/**
 * Dynamic URL helper to append Cloudinary performance transformations (f_auto, q_auto, w_800, etc.)
 * @param url Raw Cloudinary image URL or legacy image URL string
 * @param options Transformation parameters (width, quality, format)
 * @returns Transformed image URL string
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; quality?: string | number; format?: string } = {},
): string {
  if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) {
    return url || "";
  }

  // Avoid duplicating transformations if already present
  if (url.includes("/upload/f_") || url.includes("/upload/q_") || url.includes("/upload/w_")) {
    return url;
  }

  const { width = 800, quality = "auto", format = "auto" } = options;
  const params = `f_${format},q_${quality},w_${width},c_limit`;
  return url.replace("/upload/", `/upload/${params}/`);
}
