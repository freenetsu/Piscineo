import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import ClientsTableRow from "./ClientsTableRow";
import ClientsTableHeader from "./ClientsTableHeader";

// Type pour les clients

// Fonction asynchrone pour récupérer les clients de l'utilisateur connecté
async function getClientsForCurrentUser() {
  // Récupérer la session utilisateur
  const session = await getServerSession(authOptions);

  // Si aucun utilisateur n'est connecté, retourner un tableau vide
  if (!session?.user?.id) {
    return [];
  }

  // Récupérer les clients ACTIFS de l'utilisateur connecté depuis Prisma
  const clients = await prisma.client.findMany({
    where: {
      userId: session.user.id,
      active: true, // Ne récupérer que les clients actifs
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  
  console.log(`${clients.length} clients actifs récupérés pour l'utilisateur ${session.user.id}`);

  return clients;
}

export default async function ClientsTable() {
  // Récupérer les clients de l'utilisateur connecté
  const clients = await getClientsForCurrentUser();
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <ClientsTableHeader />
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Client
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Contact
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Adresse
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  État piscine
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  Voir détails client
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                >
                  Actions
                </TableCell>
                <TableCell
                  isHeader
                  className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                >
                  Date d&apos;ajout
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {clients.length === 0 && (
                <TableRow>
                  <TableCell className="px-5 py-6 text-center text-gray-500">
                    <div className="w-full text-center">
                      Aucun client trouvé. Ajoutez votre premier client pour
                      commencer.
                    </div>
                  </TableCell>
                  <TableCell className="hidden">
                    <span></span>
                  </TableCell>
                  <TableCell className="hidden">
                    <span></span>
                  </TableCell>
                  <TableCell className="hidden">
                    <span></span>
                  </TableCell>
                  <TableCell className="hidden">
                    <span></span>
                  </TableCell>
                  <TableCell className="hidden">
                    <span></span>
                  </TableCell>
                  <TableCell className="hidden">
                    <span></span>
                  </TableCell>
                  <TableCell className="hidden">
                    <span></span>
                  </TableCell>
                  <TableCell className="hidden">
                    <span></span>
                  </TableCell>
                </TableRow>
              )}
              {clients.map((client) => (
                <ClientsTableRow key={client.id} client={client} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
