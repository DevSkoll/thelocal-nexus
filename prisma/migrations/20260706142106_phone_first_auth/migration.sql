-- CreateTable
CREATE TABLE "PhoneOtpChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    "latitude" REAL,
    "longitude" REAL,
    "locationLabel" TEXT,
    "radiusMiles" INTEGER NOT NULL DEFAULT 15,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" (
    "id", "phone", "phoneVerifiedAt", "email", "emailVerifiedAt", "name", "bio", "avatarUrl",
    "verificationTier", "latitude", "longitude", "locationLabel", "radiusMiles", "createdAt", "updatedAt"
)
SELECT
    "id",
    CASE "email"
        WHEN 'joe@example.com' THEN '+15035550101'
        WHEN 'mira@example.com' THEN '+15035550102'
        WHEN 'todd@example.com' THEN '+15035550103'
        WHEN 'sam@example.com' THEN '+15035550104'
        ELSE '+1' || substr("id", 1, 10)
    END,
    CURRENT_TIMESTAMP,
    "email",
    CASE WHEN "verificationTier" = 'EMAIL' THEN CURRENT_TIMESTAMP ELSE NULL END,
    "name",
    "bio",
    "avatarUrl",
    CASE
        WHEN "verificationTier" = 'VERIFIED_HOST' THEN 'VERIFIED_HOST'
        ELSE 'UNVERIFIED'
    END,
    "latitude",
    "longitude",
    "locationLabel",
    "radiusMiles",
    "createdAt",
    "updatedAt"
FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PhoneOtpChallenge_phone_idx" ON "PhoneOtpChallenge"("phone");