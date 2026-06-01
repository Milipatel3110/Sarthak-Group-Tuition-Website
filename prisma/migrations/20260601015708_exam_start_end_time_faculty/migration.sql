/*
  Warnings:

  - You are about to drop the column `time` on the `Exam` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "time",
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "facultyId" TEXT,
ADD COLUMN     "startTime" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
