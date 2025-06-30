import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/interventions/[id] - Récupérer une intervention spécifique
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à cette intervention" },
        { status: 401 }
      );
    }

    // Extraire l'ID de l'intervention de manière asynchrone
    const { id: interventionId } = context.params;

    // Récupérer l'intervention avec vérification que le client appartient à l'utilisateur connecté
    const intervention = await prisma.intervention.findFirst({
      where: {
        id: interventionId,
        client: {
          userId: session.user.id,
        },
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            address: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!intervention) {
      return NextResponse.json(
        { error: "Intervention non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    return NextResponse.json(intervention);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'intervention:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'intervention" },
      { status: 500 }
    );
  }
}

// PUT /api/interventions/[id] - Mettre à jour une intervention
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier cette intervention" },
        { status: 401 }
      );
    }

    // Extraire l'ID de l'intervention de manière asynchrone
    const { id: interventionId } = context.params;
    const data = await request.json();
    const { clientId, description, date, nextVisit, notes, checklist, photos, signature } = data;

    // Vérifier que l'intervention existe et appartient à un client de l'utilisateur connecté
    const existingIntervention = await prisma.intervention.findFirst({
      where: {
        id: interventionId,
        client: {
          userId: session.user.id,
        },
      },
    });

    if (!existingIntervention) {
      return NextResponse.json(
        { error: "Intervention non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Si le clientId est modifié, vérifier que le nouveau client appartient bien à l'utilisateur connecté
    if (clientId && clientId !== existingIntervention.clientId) {
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
    }

    // Mettre à jour l'intervention
    const updatedIntervention = await prisma.intervention.update({
      where: { id: interventionId },
      data: {
        clientId,
        description,
        date: new Date(date),
        nextVisit: nextVisit ? new Date(nextVisit) : null,
        notes,
        checklist,
        ...(photos !== undefined && { photos }),
        ...(signature !== undefined && { signature }),
      },
    });

    return NextResponse.json(updatedIntervention);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'intervention:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'intervention" },
      { status: 500 }
    );
  }
}

// DELETE /api/interventions/[id] - Supprimer une intervention
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour supprimer cette intervention" },
        { status: 401 }
      );
    }

    // Extraire l'ID de l'intervention de manière asynchrone
    const { id: interventionId } = context.params;

    // Vérifier que l'intervention existe et appartient à un client de l'utilisateur connecté
    const existingIntervention = await prisma.intervention.findFirst({
      where: {
        id: interventionId,
        client: {
          userId: session.user.id,
        },
      },
    });

    if (!existingIntervention) {
      return NextResponse.json(
        { error: "Intervention non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Supprimer l'intervention
    await prisma.intervention.delete({
      where: {
        id: interventionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'intervention:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'intervention" },
      { status: 500 }
    );
  }
}
