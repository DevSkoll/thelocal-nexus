-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "posterType" TEXT NOT NULL,
    "posterUserId" TEXT,
    "posterGroupId" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "locationPrecision" TEXT NOT NULL DEFAULT 'APPROXIMATE',
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "recurrenceRule" TEXT,
    "capacity" INTEGER,
    "rsvpRequired" BOOLEAN NOT NULL DEFAULT false,
    "rsvpApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
    "homeHosted" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "priceMin" REAL,
    "priceMax" REAL,
    "natureTag" TEXT NOT NULL DEFAULT 'GATHERING',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_posterUserId_fkey" FOREIGN KEY ("posterUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Listing_posterGroupId_fkey" FOREIGN KEY ("posterGroupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("capacity", "createdAt", "description", "endsAt", "homeHosted", "id", "latitude", "locationLabel", "locationPrecision", "longitude", "posterGroupId", "posterType", "posterUserId", "recurrenceRule", "rsvpApprovalRequired", "rsvpRequired", "slug", "startsAt", "status", "title", "type", "updatedAt") SELECT "capacity", "createdAt", "description", "endsAt", "homeHosted", "id", "latitude", "locationLabel", "locationPrecision", "longitude", "posterGroupId", "posterType", "posterUserId", "recurrenceRule", "rsvpApprovalRequired", "rsvpRequired", "slug", "startsAt", "status", "title", "type", "updatedAt" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
