-- AlterTable
ALTER TABLE "MissionAssignment" ADD COLUMN     "checklistDone" TEXT,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "progressPercent" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MissionEvent" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "note" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "MissionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MissionEvent_assignmentId_idx" ON "MissionEvent"("assignmentId");

-- AddForeignKey
ALTER TABLE "MissionEvent" ADD CONSTRAINT "MissionEvent_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "MissionAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionEvent" ADD CONSTRAINT "MissionEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
