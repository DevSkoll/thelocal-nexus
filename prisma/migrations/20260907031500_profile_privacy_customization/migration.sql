-- AlterTable
ALTER TABLE "User" ADD COLUMN "coverImageUrl" TEXT;
ALTER TABLE "User" ADD COLUMN "pronouns" TEXT;
ALTER TABLE "User" ADD COLUMN "showRealName" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "showLocation" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "showSkills" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "showHostedListings" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "showReputation" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "showJoinDate" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ProfileLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProfileLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ProfileLink_userId_sortOrder_idx" ON "ProfileLink"("userId", "sortOrder");
