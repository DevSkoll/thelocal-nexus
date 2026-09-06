-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reviewedAt" DATETIME,
    "reviewerId" TEXT,
    "resolutionNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Report" ("createdAt", "details", "id", "listingId", "reason", "reporterId") SELECT "createdAt", "details", "id", "listingId", "reason", "reporterId" FROM "Report";
DROP TABLE "Report";
ALTER TABLE "new_Report" RENAME TO "Report";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "phoneVerifiedAt" DATETIME,
    "email" TEXT,
    "emailVerifiedAt" DATETIME,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "verificationTier" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "isModerator" BOOLEAN NOT NULL DEFAULT false,
    "reputationScore" INTEGER NOT NULL DEFAULT 0,
    "reputationUpdatedAt" DATETIME,
    "zipCode" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "locationLabel" TEXT,
    "radiusMiles" INTEGER NOT NULL DEFAULT 20,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "emailVerifiedAt", "headline", "id", "latitude", "locationLabel", "longitude", "name", "phone", "phoneVerifiedAt", "radiusMiles", "reputationScore", "reputationUpdatedAt", "slug", "updatedAt", "verificationTier", "zipCode") SELECT "avatarUrl", "bio", "createdAt", "email", "emailVerifiedAt", "headline", "id", "latitude", "locationLabel", "longitude", "name", "phone", "phoneVerifiedAt", "radiusMiles", "reputationScore", "reputationUpdatedAt", "slug", "updatedAt", "verificationTier", "zipCode" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
