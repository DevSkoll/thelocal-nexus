-- Upsert trade / home-service interest tags (safe for existing DBs)
INSERT OR IGNORE INTO "Interest" ("id", "slug", "name", "icon") VALUES
  ('interest_home_repairs', 'home-repairs', 'Home & Repairs', '🛠️');
INSERT OR IGNORE INTO "Interest" ("id", "slug", "name", "icon") VALUES
  ('interest_yard_garden', 'yard-garden', 'Yard & Garden', '🌿');
INSERT OR IGNORE INTO "Interest" ("id", "slug", "name", "icon") VALUES
  ('interest_parenting', 'parenting', 'Parenting', '👶');
INSERT OR IGNORE INTO "Interest" ("id", "slug", "name", "icon") VALUES
  ('interest_pets', 'pets', 'Pets', '🐕');
