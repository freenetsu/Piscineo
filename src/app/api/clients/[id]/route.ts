import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

// GET /api/clients/[id] - Récupérer un client spécifique
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à ce client" },
        { status: 401 }
      );
    }

    const { id: clientId } = params;

    // Récupérer le client
    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    // Vérifier que le client existe
    if (!client) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur a le droit d'accéder à ce client
    if (client.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à accéder à ce client" },
        { status: 403 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Erreur lors de la récupération du client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du client" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Mettre à jour un client
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier un client" },
        { status: 401 }
      );
    }

    const { id: clientId } = params;
    const data = await request.json();

    // Vérifier que le client existe et appartient à l'utilisateur
    const existingClient = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    if (existingClient.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce client" },
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

    // Mettre à jour le client
    const updatedClient = await prisma.client.update({
      where: {
        id: clientId,
      },
      data: {
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
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Supprimer un client
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("DELETE API appelée avec params:", params);
    
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("Erreur d'authentification: utilisateur non connecté");
      return NextResponse.json(
        { error: "Vous devez être connecté pour supprimer un client" },
        { status: 401 }
      );
    }

    // Extraire l'ID du client des paramètres
    const { id: clientId } = params;
    console.log("ID du client à supprimer:", clientId);

    // Vérifier que le client existe et appartient à l'utilisateur
    const existingClient = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!existingClient) {
      console.log("Client non trouvé avec l'ID:", clientId);
      return NextResponse.json(
        { error: "Client non trouvé" },
        { status: 404 }
      );
    }

    if (existingClient.userId !== session.user.id) {
      console.log("Erreur d'autorisation: l'utilisateur n'est pas propriétaire du client");
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce client" },
        { status: 403 }
      );
    }

    // Désactiver le client (suppression logique)
    console.log("Désactivation du client avec ID:", clientId);
    const deletedClient = await prisma.client.update({
      where: {
        id: clientId,
      },
      data: {
        active: false,
      },
    });

    console.log("Client désactivé avec succès:", deletedClient);
    return NextResponse.json({ 
      message: "Client supprimé avec succès",
      client: deletedClient 
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du client" },
      { status: 500 }
    );
  }
}
