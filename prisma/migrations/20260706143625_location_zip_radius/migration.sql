-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "phoneVerifiedAt" DATETIME,
    "email" TEXT,
    "emailVerifiedAt" DATETIME,
    "name" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "verificationTier" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "zipCode" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "locationLabel" TEXT,
    "radiusMiles" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "emailVerifiedAt", "id", "latitude", "locationLabel", "longitude", "name", "phone", "phoneVerifiedAt", "radiusMiles", "updatedAt", "verificationTier") SELECT "avatarUrl", "bio", "createdAt", "email", "emailVerifiedAt", "id", "latitude", "locationLabel", "longitude", "name", "phone", "phoneVerifiedAt", "radiusMiles", "updatedAt", "verificationTier" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
