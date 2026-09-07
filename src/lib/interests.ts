import { db } from "./db";
import { LISTING_CATEGORIES } from "./constants";

const CANONICAL_SLUGS = new Set<string>(LISTING_CATEGORIES.map((c) => c.slug));

/** Insert any missing taxonomy rows so multi-tag selects actually persist. */
export async function ensureCanonicalInterests() {
  const existing = await db.interest.findMany({
    where: { slug: { in: LISTING_CATEGORIES.map((c) => c.slug) } },
    select: { slug: true },
  });
  const have = new Set(existing.map((row) => row.slug));
  const missing = LISTING_CATEGORIES.filter((c) => !have.has(c.slug));
  if (missing.length === 0) return;
  await db.interest.createMany({
    data: missing.map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon,
    })),
  });
}

export async function resolveInterestsBySlugs(slugs: string[]) {
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
  if (unique.length === 0) {
    throw new Error("Select at least one interest");
  }
  const unknown = unique.find((s) => !CANONICAL_SLUGS.has(s));
  if (unknown) {
    throw new Error(`Unknown interest: ${unknown}`);
  }

  await ensureCanonicalInterests();

  const interests = await db.interest.findMany({
    where: { slug: { in: unique } },
  });
  if (interests.length !== unique.length) {
    throw new Error("Select at least one interest");
  }
  return interests;
}
