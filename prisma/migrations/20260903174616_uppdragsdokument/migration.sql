-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "missionId" TEXT,
ADD COLUMN     "missionSource" TEXT;

-- CreateIndex
CREATE INDEX "MediaAsset_missionId_idx" ON "MediaAsset"("missionId");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
