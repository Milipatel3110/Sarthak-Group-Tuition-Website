-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'PARENT', 'FACULTY', 'ADMIN');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('LIVE_CLASS', 'DOUBT_SESSION', 'PTM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GalleryCategory" AS ENUM ('BUILDING', 'CLASSROOM', 'EVENTS', 'TRIPS', 'PARTIES');

-- CreateEnum
CREATE TYPE "EnrollmentRequestStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "profilePhoto" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "class" TEXT NOT NULL,
    "medium" TEXT NOT NULL DEFAULT 'English',
    "schoolName" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occupation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacultyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "subjects" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacultyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subjects" TEXT NOT NULL,
    "targetClass" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "duration" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "syllabus" TEXT,
    "schedule" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "facultyId" TEXT,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "maxMarks" INTEGER NOT NULL DEFAULT 100,
    "attachments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSubmission" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "submissionText" TEXT,
    "attachments" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "marks" INTEGER,
    "feedback" TEXT,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "grade" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentFrequency" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "lateFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "academicYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePayment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "roomNumber" TEXT,
    "facultyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionType" "SessionType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 60,
    "courseId" TEXT,
    "facultyId" TEXT NOT NULL,
    "meetingLink" TEXT,
    "recordingUrl" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoLecture" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "chapter" TEXT,
    "topic" TEXT,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoLecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "parentName" TEXT,
    "class" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "message" TEXT NOT NULL,
    "photoUrl" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "GalleryCategory" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "userQuery" TEXT NOT NULL,
    "botResponse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facultyId" TEXT,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "status" "EnrollmentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "ParentProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyProfile_userId_key" ON "FacultyProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_studentId_courseId_key" ON "CourseEnrollment"("studentId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_studentId_key" ON "AssignmentSubmission"("assignmentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_courseId_date_key" ON "Attendance"("studentId", "courseId", "date");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyProfile" ADD CONSTRAINT "FacultyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoLecture" ADD CONSTRAINT "VideoLecture_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoLecture" ADD CONSTRAINT "VideoLecture_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "FacultyProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
