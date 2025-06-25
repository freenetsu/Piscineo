import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: params.email,
      },
      select: {
        name: true,
        email: true,
        companyName: true,
        phone: true,
        role: true,
        subscriptionPlan: true,
        activeUntil: true,
        facebook: true,
        instagram: true,
        country: true,
        city: true,
        postalCode: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Error fetching user data' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const body = await request.json();
    const { country, city, postalCode, facebook, instagram } = body;

    const user = await prisma.user.update({
      where: {
        email: params.email,
      },
      data: {
        country,
        city,
        postalCode,
        facebook,
        instagram,
      },
      select: {
        country: true,
        city: true,
        postalCode: true,
        facebook: true,
        instagram: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error updating user data' },
      { status: 500 }
    );
  }
}
