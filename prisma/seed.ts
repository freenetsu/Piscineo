import { PrismaClient, Role, SubscriptionPlan } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Création des utilisateurs (piscinistes)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@piscineo.com' },
    update: {},
    create: {
      name: 'Admin Piscineo',
      email: 'admin@piscineo.com',
      role: Role.ADMIN,
      subscriptionPlan: SubscriptionPlan.PRO,
      companyName: 'Piscineo Admin',
      phone: '+33612345678',
      country: 'France',
      city: 'Paris',
      postalCode: '75001',
      facebook: 'https://facebook.com/piscineo',
      instagram: 'https://instagram.com/piscineo',
      activeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
    },
  });

  const proUser = await prisma.user.upsert({
    where: { email: 'pro@piscineo.com' },
    update: {},
    create: {
      name: 'Pierre Martin',
      email: 'pro@piscineo.com',
      role: Role.PRO,
      subscriptionPlan: SubscriptionPlan.BASIC,
      companyName: 'Piscines & Co',
      phone: '+33687654321',
      country: 'France',
      city: 'Lyon',
      postalCode: '69000',
      facebook: 'https://facebook.com/piscines-et-co',
      instagram: 'https://instagram.com/piscines_et_co',
      activeUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 mois
    },
  });

  const freeUser = await prisma.user.upsert({
    where: { email: 'free@piscineo.com' },
    update: {},
    create: {
      name: 'Sophie Dubois',
      email: 'free@piscineo.com',
      role: Role.PRO,
      subscriptionPlan: SubscriptionPlan.FREE,
      companyName: 'Piscines Dubois',
      phone: '+33678901234',
      country: 'France',
      city: 'Marseille',
      postalCode: '13000',
      activeUntil: null,
    },
  });

  console.log('Users created:', { adminUser, proUser, freeUser });

  // Création des clients pour l'utilisateur PRO
  const clients = [
    {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '+33612345678',
      address: '15 rue des Lilas, 69003 Lyon',
      addressComment: 'Portail blanc, code 1234',
      accessCode: '1234',
      poolState: 'Bon état',
      poolType: 'Enterrée',
      poolSize: '8m x 4m',
      serviceFrequency: 'Hebdomadaire',
      poolDetails: {
        volume: '64m³',
        filtration: 'Sable',
        chauffage: 'Pompe à chaleur',
        traitement: 'Chlore',
      },
      notes: 'Client depuis 2020, très satisfait',
      lastService: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours avant
    },
    {
      firstName: 'Marie',
      lastName: 'Laurent',
      email: 'marie.laurent@example.com',
      phone: '+33623456789',
      address: '8 avenue des Roses, 69005 Lyon',
      addressComment: 'Accès par le garage',
      accessCode: '5678',
      poolState: 'Nécessite entretien',
      poolType: 'Hors-sol',
      poolSize: '6m x 3m',
      serviceFrequency: 'Mensuel',
      poolDetails: {
        volume: '36m³',
        filtration: 'Cartouche',
        chauffage: 'Aucun',
        traitement: 'Sel',
      },
      notes: 'Problèmes récurrents d\'algues',
      lastService: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours avant
    },
    {
      firstName: 'Robert',
      lastName: 'Petit',
      email: 'robert.petit@example.com',
      phone: '+33634567890',
      address: '25 boulevard des Pins, 69007 Lyon',
      poolState: 'Excellent',
      poolType: 'Enterrée avec débordement',
      poolSize: '10m x 5m',
      serviceFrequency: 'Bimensuel',
      poolDetails: {
        volume: '100m³',
        filtration: 'Diatomée',
        chauffage: 'Solaire',
        traitement: 'UV',
      },
      lastService: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 jours avant
    },
    {
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@example.com',
      phone: '+33645678901',
      address: '12 rue du Commerce, 69002 Lyon',
      addressComment: 'Sonnette au nom de Martin',
      poolState: 'Moyen',
      poolType: 'Enterrée',
      poolSize: '7m x 3.5m',
      serviceFrequency: 'Hebdomadaire',
      poolDetails: {
        volume: '49m³',
        filtration: 'Sable',
        chauffage: 'Électrique',
        traitement: 'Chlore',
      },
      notes: 'Propriétaire souvent absent',
      lastService: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours avant
    },
    {
      firstName: 'Philippe',
      lastName: 'Durand',
      email: 'philippe.durand@example.com',
      phone: '+33656789012',
      address: '5 impasse des Cerisiers, 69100 Villeurbanne',
      accessCode: '9876',
      poolState: 'Nécessite réparation',
      poolType: 'Enterrée',
      poolSize: '9m x 4.5m',
      serviceFrequency: 'Hebdomadaire',
      poolDetails: {
        volume: '81m³',
        filtration: 'Sable',
        chauffage: 'Pompe à chaleur',
        traitement: 'Brome',
      },
      notes: 'Problème de fuite à surveiller',
      lastService: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours avant
    },
  ];

  // Création des clients pour l'utilisateur PRO
  for (const client of clients) {
    const createdClient = await prisma.client.create({
      data: {
        ...client,
        userId: proUser.id,
        poolDetails: client.poolDetails as any,
      },
    });
    console.log('Client created:', createdClient.firstName, createdClient.lastName);

    // Création d'interventions pour chaque client
    if (client.lastService) {
      await prisma.intervention.create({
        data: {
          clientId: createdClient.id,
          description: 'Entretien régulier',
          checklist: {
            nettoyageFiltres: true,
            aspirationFond: true,
            traitementEau: true,
            controlePH: true,
            controleChloreLivre: true,
          },
          parameters: {
            pH: 7.2,
            chlore: 1.5,
            alcalinite: 120,
            temperature: 26,
          },
          products: {
            chloreChoc: { name: 'Chlore choc', quantity: '200g' },
            antiAlgues: { name: 'Anti-algues', quantity: '100ml' },
            floculant: { name: 'Floculant', quantity: '50ml' },
          },
          photos: {
            avant: 'https://example.com/photos/avant.jpg',
            apres: 'https://example.com/photos/apres.jpg',
          },
          signature: 'https://example.com/signatures/signature.png',
          date: client.lastService,
          nextVisit: new Date(client.lastService.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 jours après
        },
      });
      console.log('Intervention created for client:', createdClient.firstName, createdClient.lastName);
    }
  }

  // Création de clients pour l'utilisateur FREE (limité à 3 pour respecter la limite de 5)
  const freeClients = [
    {
      firstName: 'Julien',
      lastName: 'Leroy',
      email: 'julien.leroy@example.com',
      phone: '+33667890123',
      address: '18 rue de la Plage, 13008 Marseille',
      poolState: 'Bon état',
      poolType: 'Enterrée',
      poolSize: '6m x 3m',
      serviceFrequency: 'Mensuel',
      lastService: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 jours avant
    },
    {
      firstName: 'Nathalie',
      lastName: 'Blanc',
      email: 'nathalie.blanc@example.com',
      phone: '+33678901234',
      address: '7 avenue du Prado, 13006 Marseille',
      poolState: 'Excellent',
      poolType: 'Hors-sol',
      poolSize: '5m x 3m',
      serviceFrequency: 'Bimensuel',
      lastService: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 jours avant
    },
    {
      firstName: 'Michel',
      lastName: 'Girard',
      email: 'michel.girard@example.com',
      phone: '+33689012345',
      address: '12 boulevard Longchamp, 13001 Marseille',
      poolState: 'Moyen',
      poolType: 'Enterrée',
      poolSize: '7m x 3.5m',
      serviceFrequency: 'Hebdomadaire',
      lastService: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 jours avant
    },
  ];

  // Création des clients pour l'utilisateur FREE
  for (const client of freeClients) {
    const createdClient = await prisma.client.create({
      data: {
        ...client,
        userId: freeUser.id,
      },
    });
    console.log('Free client created:', createdClient.firstName, createdClient.lastName);
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
