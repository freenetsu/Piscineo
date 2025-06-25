import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, name, companyName, phone, facebook, instagram } = body;

    const updatedUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        name,
        companyName,
        phone,
        facebook,
        instagram,
      },
      select: {
        name: true,
        email: true,
        companyName: true,
        phone: true,
        role: true,
        facebook: true,
        instagram: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error updating user data' },
      { status: 500 }
    );
  }
}
