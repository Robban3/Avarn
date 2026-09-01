-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "dogId" TEXT,
ADD COLUMN     "profileUserId" TEXT;

-- CreateIndex
CREATE INDEX "MediaAsset_dogId_idx" ON "MediaAsset"("dogId");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_dogId_fkey" FOREIGN KEY ("dogId") REFERENCES "Dog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
