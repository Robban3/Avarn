-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "areaPolygon" TEXT,
ADD COLUMN     "areaSizeSqm" INTEGER,
ADD COLUMN     "meetingLat" DOUBLE PRECISION,
ADD COLUMN     "meetingLng" DOUBLE PRECISION,
ADD COLUMN     "parkingLat" DOUBLE PRECISION,
ADD COLUMN     "parkingLng" DOUBLE PRECISION;
