/**
 * Convert a company name to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Find a record by slug (case-insensitive, handles spaces and hyphens)
 */
export function findBySlug<T extends { name: string }>(records: T[], slug: string): T | undefined {
  const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');
  
  return records.find(record => {
    const normalizedName = record.name.toLowerCase().replace(/-/g, ' ');
    return normalizedName === normalizedSlug || slugify(record.name) === slug;
  });
}

