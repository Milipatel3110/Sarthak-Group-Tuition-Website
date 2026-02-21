import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

// ✅ Force Node.js runtime (Prisma + bcrypt need Node runtime)
export const runtime = "nodejs";

const prisma = new PrismaClient();

// ✅ Prisma payload type for users with profiles included
type UserWithProfiles = Prisma.UserGetPayload<{
  include: {
    studentProfile: true;
    parentProfile: true;
    facultyProfile: true;
  };
}>;

// ✅ Helper to remove password safely
function stripPassword(user: UserWithProfiles) {
  // password may exist on the type; remove it from the returned object
  const { password, ...rest } = user as any;
  return rest;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      class: studentClass,
      medium,
      schoolName,
      parentId,
      occupation,
      qualification,
      subjects,
      experienceYears,
      bio,
      isOwner,
    } = body as Record<string, any>;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "email, password, and role are required" },
        { status: 400 }
      );
    }

    const allowedRoles = ["STUDENT", "PARENT", "FACULTY", "ADMIN"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let user: UserWithProfiles;

    switch (role) {
      case "STUDENT":
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "STUDENT",
            firstName,
            lastName,
            phone,
            studentProfile: {
              create: {
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                class: studentClass,
                medium: medium || "English",
                schoolName,
                parentId,
              },
            },
          },
          include: { studentProfile: true, parentProfile: true, facultyProfile: true },
        });
        break;

      case "PARENT":
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "PARENT",
            firstName,
            lastName,
            phone,
            parentProfile: { create: { occupation } },
          },
          include: { studentProfile: true, parentProfile: true, facultyProfile: true },
        });
        break;

      case "FACULTY":
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "FACULTY",
            firstName,
            lastName,
            phone,
            facultyProfile: {
              create: {
                qualification,
                subjects: JSON.stringify(subjects || []),
                experienceYears: experienceYears || 0,
                bio,
                isOwner: isOwner || false,
              },
            },
          },
          include: { studentProfile: true, parentProfile: true, facultyProfile: true },
        });
        break;

      case "ADMIN":
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "ADMIN",
            firstName,
            lastName,
            phone,
          },
          include: { studentProfile: true, parentProfile: true, facultyProfile: true },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: stripPassword(user),
      message: `${String(role).toLowerCase()} created successfully`,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // ✅ No `any` here
    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role as any;

    if (search && search.trim()) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users: UserWithProfiles[] = await prisma.user.findMany({
      where,
      include: { studentProfile: true, parentProfile: true, facultyProfile: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      users: users.map(stripPassword),
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching users" },
      { status: 500 }
    );
  }
}