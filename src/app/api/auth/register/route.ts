import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
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
      isOwner
    } = await request.json()

    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    let user
    
    switch (role) {
      case 'STUDENT':
        user = await prisma.user.create({
          data: {
            email, password: hashedPassword, role: 'STUDENT', firstName, lastName, phone,
            studentProfile: {
              create: {
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                class: studentClass,
                medium: medium || 'English',
                schoolName, parentId,
              }
            }
          },
          include: { studentProfile: true }
        })
        break
      case 'PARENT':
        user = await prisma.user.create({
          data: {
            email, password: hashedPassword, role: 'PARENT', firstName, lastName, phone,
            parentProfile: { create: { occupation } }
          },
          include: { parentProfile: true }
        })
        break
      case 'FACULTY':
        user = await prisma.user.create({
          data: {
            email, password: hashedPassword, role: 'FACULTY', firstName, lastName, phone,
            facultyProfile: {
              create: { qualification, subjects: JSON.stringify(subjects || []), experienceYears: experienceYears || 0, bio, isOwner: isOwner || false }
            }
          },
          include: { facultyProfile: true }
        })
        break
      case 'ADMIN':
        user = await prisma.user.create({
          data: { email, password: hashedPassword, role: 'ADMIN', firstName, lastName, phone }
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ success: true, user: userWithoutPassword, message: `${role.toLowerCase()} created successfully` })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const where: any = {}
    
    if (role) where.role = role
    if (search) where.OR = [{ firstName: { contains: search } }, { lastName: { contains: search } }, { email: { contains: search } }]

    const users = await prisma.user.findMany({
      where,
      include: { studentProfile: true, parentProfile: true, facultyProfile: true },
      orderBy: { createdAt: 'desc' },
    })

    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })

    return NextResponse.json({ success: true, users: usersWithoutPassword })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'An error occurred while fetching users' }, { status: 500 })
  }
}

