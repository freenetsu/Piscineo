'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface AddClientData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
}

export async function addClient(data: AddClientData) {
  try {
    // Récupérer l'utilisateur admin (à adapter selon votre logique)
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      throw new Error('Aucun utilisateur admin trouvé');
    }

    const client = await prisma.client.create({
      data: {
        lastName: data.nom,
        firstName: data.prenom,
        email: data.email,
        phone: data.telephone,
        address: data.adresse,
        user: {
          connect: { id: admin.id }
        }
      },
    });

    revalidatePath('/clients/listeClients');
    return { success: true, data: client };
  } catch (error) {
    console.error('Erreur lors de l\'ajout du client:', error);
    return { success: false, error: 'Une erreur est survenue lors de l\'ajout du client' };
  }
}
