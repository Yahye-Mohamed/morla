import { slugify } from "./slugify.js";

export async function createUniqueSlug(model, value, excludeId = null) {
  const baseSlug = slugify(value);

  if (!baseSlug) {
    return "item";
  }

  let slug = baseSlug;
  let suffix = 2;

  // Keep slugs stable and collision-free for admin edits.
  while (await model.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
