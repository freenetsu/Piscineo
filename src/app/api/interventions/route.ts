import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST /api/interventions - Créer une nouvelle intervention
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour créer une intervention" },
        { status: 401 }
      );
    }

    // Extraire les données de la requête
    const data = await request.json();
    const { clientId, description, date, nextVisit, notes, checklist, photos, signature } = data;

    // Vérifier que le client appartient bien à l'utilisateur connecté
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
        userId: session.user.id,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    // Créer l'intervention
    const intervention = await prisma.intervention.create({
      data: {
        clientId,
        description,
        date: new Date(date),
        nextVisit: nextVisit ? new Date(nextVisit) : null,
        notes,
        checklist: checklist || "[]",
        photos: photos || null,
        signature: signature || null,
      },
    });

    return NextResponse.json(intervention, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'intervention:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'intervention" },
      { status: 500 }
    );
  }
}

// GET /api/interventions - Récupérer toutes les interventions de l'utilisateur connecté
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour récupérer les interventions" },
        { status: 401 }
      );
    }

    // Récupérer les interventions de l'utilisateur connecté
    const interventions = await prisma.intervention.findMany({
      where: {
        client: {
          userId: session.user.id,
          active: true, // Ne récupérer que les interventions des clients actifs
        },
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            address: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(interventions);
  } catch (error) {
    console.error("Erreur lors de la récupération des interventions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des interventions" },
      { status: 500 }
    );
  }
}

// Note: La route DELETE pour supprimer une intervention est implémentée dans /app/api/interventions/[id]/route.ts
// qui utilise le routage dynamique de Next.js pour accéder au paramètre id
