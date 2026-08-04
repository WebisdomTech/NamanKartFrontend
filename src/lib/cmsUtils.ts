/**
 * Global helper function to determine if a value contains meaningful non-empty CMS content.
 */
export function hasContent(val: any): boolean {
  if (val === null || val === undefined) return false;

  if (typeof val === "string") {
    return val.trim().length > 0;
  }

  if (typeof val === "number") {
    return !isNaN(val);
  }

  if (typeof val === "boolean") {
    return val;
  }

  if (Array.isArray(val)) {
    return val.length > 0 && val.some((item) => hasContent(item));
  }

  if (typeof val === "object") {
    const keys = Object.keys(val);
    if (keys.length === 0) return false;
    return keys.some((key) => hasContent(val[key]));
  }

  return false;
}
