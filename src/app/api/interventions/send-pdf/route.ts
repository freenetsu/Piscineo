import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { generateAndSendInterventionPDF } from "@/lib/pdfService";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'ID de l'intervention depuis le corps de la requête
    const { interventionId } = await req.json();
    
    if (!interventionId) {
      return NextResponse.json(
        { error: "ID d'intervention manquant" },
        { status: 400 }
      );
    }

    // Récupérer l'intervention avec les données du client
    const intervention = await prisma.intervention.findUnique({
      where: { id: interventionId },
      include: { client: true },
    });

    if (!intervention) {
      return NextResponse.json(
        { error: "Intervention non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que l'intervention appartient à l'utilisateur connecté
    const client = await prisma.client.findUnique({
      where: { id: intervention.clientId },
    });

    if (!client || client.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Générer et envoyer le PDF par email
    const success = await generateAndSendInterventionPDF(intervention);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du PDF:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
}
