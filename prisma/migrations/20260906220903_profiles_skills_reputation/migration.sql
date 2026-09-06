/*
  Warnings:

  - Added the required column `slug` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SkillOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "latitude" REAL,
    "longitude" REAL,
    "locationLabel" TEXT,
    "radiusMiles" INTEGER,
    "priceMin" REAL,
    "priceMax" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SkillOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkillOfferInterest" (
    "skillOfferId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,

    PRIMARY KEY ("skillOfferId", "interestId"),
    CONSTRAINT "SkillOfferInterest_skillOfferId_fkey" FOREIGN KEY ("skillOfferId") REFERENCES "SkillOffer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SkillOfferInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReputationEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subjectUserId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "listingId" TEXT,
    "skillOfferId" TEXT,
    "reason" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReputationEvent_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReputationEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReputationEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReputationEvent_skillOfferId_fkey" FOREIGN KEY ("skillOfferId") REFERENCES "SkillOffer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "listingId" TEXT,
    "skillOfferId" TEXT,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Feedback_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Feedback_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Feedback_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Feedback_skillOfferId_fkey" FOREIGN KEY ("skillOfferId") REFERENCES "SkillOffer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "slug" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "verificationTier" TEXT NOT NULL DEFAULT 'UNVERIFIED',
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
INSERT INTO "new_User" ("avatarUrl", "bio", "createdAt", "email", "emailVerifiedAt", "id", "latitude", "locationLabel", "longitude", "name", "phone", "phoneVerifiedAt", "radiusMiles", "updatedAt", "verificationTier", "zipCode") SELECT "avatarUrl", "bio", "createdAt", "email", "emailVerifiedAt", "id", "latitude", "locationLabel", "longitude", "name", "phone", "phoneVerifiedAt", "radiusMiles", "updatedAt", "verificationTier", "zipCode" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SkillOffer_slug_key" ON "SkillOffer"("slug");

-- CreateIndex
CREATE INDEX "ReputationEvent_subjectUserId_createdAt_idx" ON "ReputationEvent"("subjectUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_toUserId_createdAt_idx" ON "Feedback"("toUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_fromUserId_toUserId_listingId_key" ON "Feedback"("fromUserId", "toUserId", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_fromUserId_toUserId_skillOfferId_key" ON "Feedback"("fromUserId", "toUserId", "skillOfferId");
