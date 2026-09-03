-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "equipment" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "meetingPoint" TEXT,
ADD COLUMN     "missionArea" TEXT,
ADD COLUMN     "parkingInfo" TEXT;

-- AlterTable
ALTER TABLE "MissionAssignment" ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OperationalReport" ADD COLUMN     "areaSize" INTEGER,
ADD COLUMN     "comment" TEXT;
