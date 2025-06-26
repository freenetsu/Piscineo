import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

// POST /api/clients - Créer un nouveau client
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour créer un client" },
        { status: 401 }
      );
    }

    // Récupérer les données du client depuis la requête
    const data = await request.json();
    
    // Vérifier que l'utilisateur crée un client pour lui-même
    if (data.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez créer des clients que pour votre compte" },
        { status: 403 }
      );
    }

    // Vérifier les champs obligatoires
    if (!data.firstName || !data.lastName || !data.address) {
      return NextResponse.json(
        { error: "Le prénom, le nom et l'adresse sont obligatoires" },
        { status: 400 }
      );
    }

    // Créer le client dans la base de données
    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        addressComment: data.addressComment || null,
        accessCode: data.accessCode || null,
        poolState: data.poolState || null,
        poolType: data.poolType || null,
        poolSize: data.poolSize || null,
        serviceFrequency: data.serviceFrequency || null,
        notes: data.notes || null,
        active: true,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du client" },
      { status: 500 }
    );
  }
}

// GET /api/clients - Récupérer tous les clients de l'utilisateur connecté
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à vos clients" },
        { status: 401 }
      );
    }

    // Récupérer les clients de l'utilisateur
    const clients = await prisma.client.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des clients" },
      { status: 500 }
    );
  }
}
