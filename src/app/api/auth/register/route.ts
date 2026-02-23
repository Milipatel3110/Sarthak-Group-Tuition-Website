import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const allowedRoles: Role[] = ["STUDENT", "PARENT", "FACULTY", "ADMIN"];

const safeChildUserSelect = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  phone: true,
  profilePhoto: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const userWithProfileInclude = {
  studentProfile: true,
  parentProfile: {
    include: {
      children: {
        include: {
          user: {
            select: safeChildUserSelect,
          },
        },
      },
    },
  },
  facultyProfile: true,
} satisfies Prisma.UserInclude;

type UserWithProfiles = Prisma.UserGetPayload<{
  include: typeof userWithProfileInclude;
}>;

function stripPassword(user: UserWithProfiles) {
  const { password, ...rest } = user;
  return rest;
}

function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function normalizeSubjects(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((subject) => String(subject).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean);
  }
  return [];
}

async function fetchUsers(where: Prisma.UserWhereInput) {
  const users = await prisma.user.findMany({
    where,
    include: userWithProfileInclude,
    orderBy: { createdAt: "desc" },
  });

  return users.map(stripPassword);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "") as Role;
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const phone = body.phone ? String(body.phone) : null;

    const dateOfBirth = parseOptionalDate(body.dateOfBirth);
    const studentClass = body.class ? String(body.class) : null;
    const medium = body.medium ? String(body.medium) : "English";
    const schoolName = body.schoolName ? String(body.schoolName) : null;
    const parentId = body.parentId ? String(body.parentId) : null;
    const occupation = body.occupation ? String(body.occupation) : null;
    const qualification = body.qualification ? String(body.qualification) : "Not specified";
    const subjects = normalizeSubjects(body.subjects);
    const experienceYears =
      typeof body.experienceYears === "number"
        ? body.experienceYears
        : Number(body.experienceYears || 0);
    const bio = body.bio ? String(body.bio) : null;
    const isOwner = Boolean(body.isOwner);

    if (!email || !password || !role || !firstName || !lastName) {
      return NextResponse.json(
        { error: "firstName, lastName, email, password, and role are required" },
        { status: 400 }
      );
    }

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
            role,
            firstName,
            lastName,
            phone,
            studentProfile: {
              create: {
                dateOfBirth: dateOfBirth ?? null,
                class: studentClass || "Class 1",
                medium,
                schoolName,
                parent: parentId ? { connect: { id: parentId } } : undefined,
              },
            },
          },
          include: userWithProfileInclude,
        });
        break;
      case "PARENT":
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role,
            firstName,
            lastName,
            phone,
            parentProfile: {
              create: {
                occupation,
              },
            },
          },
          include: userWithProfileInclude,
        });
        break;
      case "FACULTY":
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role,
            firstName,
            lastName,
            phone,
            facultyProfile: {
              create: {
                qualification,
                subjects: JSON.stringify(subjects),
                experienceYears: Number.isFinite(experienceYears) ? experienceYears : 0,
                bio,
                isOwner,
              },
            },
          },
          include: userWithProfileInclude,
        });
        break;
      case "ADMIN":
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role,
            firstName,
            lastName,
            phone,
          },
          include: userWithProfileInclude,
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: stripPassword(user),
      message: `${role.toLowerCase()} created successfully`,
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
    const isActive = searchParams.get("isActive");

    const where: Prisma.UserWhereInput = {};

    if (role) {
      if (!allowedRoles.includes(role as Role)) {
        return NextResponse.json({ error: "Invalid role filter" }, { status: 400 });
      }
      where.role = role as Role;
    }

    if (isActive === "true" || isActive === "false") {
      where.isActive = isActive === "true";
    }

    if (search && search.trim()) {
      where.OR = [
        { firstName: { contains: search.trim(), mode: "insensitive" } },
        { lastName: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const users = await fetchUsers(where);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id || "");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: userWithProfileInclude,
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = body.email ? String(body.email).trim().toLowerCase() : undefined;
    if (email && email !== existingUser.email) {
      const collision = await prisma.user.findUnique({ where: { email } });
      if (collision) {
        return NextResponse.json(
          { error: "Another user with this email already exists" },
          { status: 400 }
        );
      }
    }

    let hashedPassword: string | undefined;
    if (body.password && String(body.password).trim()) {
      hashedPassword = await bcrypt.hash(String(body.password), 12);
    }

    const userUpdateData: Prisma.UserUpdateInput = {
      email,
      password: hashedPassword,
      firstName: body.firstName ? String(body.firstName).trim() : undefined,
      lastName: body.lastName ? String(body.lastName).trim() : undefined,
      phone:
        body.phone === null || body.phone === ""
          ? null
          : body.phone
            ? String(body.phone)
            : undefined,
      isActive:
        typeof body.isActive === "boolean" ? body.isActive : undefined,
    };

    if (existingUser.role === "STUDENT") {
      const studentData: Prisma.StudentProfileUpdateInput = {
        class: body.class ? String(body.class) : undefined,
        medium: body.medium ? String(body.medium) : undefined,
        schoolName:
          body.schoolName === null || body.schoolName === ""
            ? null
            : body.schoolName
              ? String(body.schoolName)
              : undefined,
      };

      if (Object.prototype.hasOwnProperty.call(body, "parentId")) {
        studentData.parent =
          body.parentId === null || body.parentId === ""
            ? { disconnect: true }
            : body.parentId
              ? { connect: { id: String(body.parentId) } }
              : undefined;
      }

      const parsedDob = parseOptionalDate(body.dateOfBirth);
      if (parsedDob !== undefined) {
        studentData.dateOfBirth = parsedDob;
      }

      userUpdateData.studentProfile = existingUser.studentProfile
        ? { update: studentData }
        : {
            create: {
              class: body.class ? String(body.class) : "Class 1",
              medium: body.medium ? String(body.medium) : "English",
              schoolName:
                body.schoolName === null || body.schoolName === ""
                  ? null
                  : body.schoolName
                    ? String(body.schoolName)
                    : null,
              parent:
                body.parentId === null || body.parentId === ""
                  ? undefined
                  : body.parentId
                    ? { connect: { id: String(body.parentId) } }
                    : undefined,
              dateOfBirth: parseOptionalDate(body.dateOfBirth) ?? null,
            },
          };
    }

    if (existingUser.role === "PARENT") {
      userUpdateData.parentProfile = existingUser.parentProfile
        ? {
            update: {
              occupation:
                body.occupation === null || body.occupation === ""
                  ? null
                  : body.occupation
                    ? String(body.occupation)
                    : undefined,
            },
          }
        : {
            create: {
              occupation:
                body.occupation === null || body.occupation === ""
                  ? null
                  : body.occupation
                    ? String(body.occupation)
                    : null,
            },
          };
    }

    if (existingUser.role === "FACULTY") {
      const parsedExperience =
        body.experienceYears === undefined
          ? undefined
          : Number(body.experienceYears);

      userUpdateData.facultyProfile = existingUser.facultyProfile
        ? {
            update: {
              qualification: body.qualification ? String(body.qualification) : undefined,
              subjects:
                body.subjects !== undefined
                  ? JSON.stringify(normalizeSubjects(body.subjects))
                  : undefined,
              experienceYears:
                parsedExperience !== undefined && Number.isFinite(parsedExperience)
                  ? parsedExperience
                  : undefined,
              bio:
                body.bio === null || body.bio === ""
                  ? null
                  : body.bio
                    ? String(body.bio)
                    : undefined,
              isOwner: typeof body.isOwner === "boolean" ? body.isOwner : undefined,
            },
          }
        : {
            create: {
              qualification: body.qualification ? String(body.qualification) : "Not specified",
              subjects: JSON.stringify(normalizeSubjects(body.subjects)),
              experienceYears:
                parsedExperience !== undefined && Number.isFinite(parsedExperience)
                  ? parsedExperience
                  : 0,
              bio:
                body.bio === null || body.bio === ""
                  ? null
                  : body.bio
                    ? String(body.bio)
                    : null,
              isOwner: typeof body.isOwner === "boolean" ? body.isOwner : false,
            },
          };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: userUpdateData,
      include: userWithProfileInclude,
    });

    return NextResponse.json({
      success: true,
      user: stripPassword(updatedUser),
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const hardDelete = searchParams.get("hard") === "true";

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (hardDelete) {
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: "User permanently deleted",
      });
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}