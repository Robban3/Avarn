-- AlterTable
ALTER TABLE "Dog" ADD COLUMN     "color" TEXT,
ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "hipsElbows" TEXT,
ADD COLUMN     "insuranceValidTo" TIMESTAMP(3),
ADD COLUMN     "insurer" TEXT,
ADD COLUMN     "mentalIndex" TEXT,
ADD COLUMN     "neutered" BOOLEAN,
ADD COLUMN     "originCountry" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "weightKg" DOUBLE PRECISION;
