"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { useEffect, useState } from "react";
import InterventionsTableRow from "./InterventionsTableRow";
import InterventionForm from "../forms/InterventionForm";
import { useSession } from "next-auth/react";

interface Client {
  firstName: string;
  lastName: string;
  address: string;
}

interface Intervention {
  id: string;
  clientId: string;
  description: string;
  date: Date;
  nextVisit: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  client: Client;
}

export default function InterventionsTable() {
  const { data: session } = useSession();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour récupérer les interventions
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/interventions');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des interventions');
        }
        const data = await response.json();
        setInterventions(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchInterventions();
    }
  }, [session, refreshKey]);

  // Fonction pour rafraîchir les données après une action
  const refreshData = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="flex justify-between items-center border-b border-gray-200 p-5 dark:border-gray-800">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Liste des interventions
        </h4>
        <div className="flex items-center gap-2">
          <InterventionForm onSuccess={refreshData} />
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        {isLoading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement...</span>
          </div>
        ) : (
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
                    Description
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
                    Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-center font-medium text-gray-500 dark:text-gray-400"
                  >
                    Voir détails intervention
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
                    Prochaine visite
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {interventions.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-center text-gray-500">
                      <div className="w-full text-center">
                        Aucune intervention trouvée. Ajoutez votre première
                        intervention pour commencer.
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
                  </TableRow>
                )}
                {interventions.map((intervention) => (
                  <InterventionsTableRow
                    key={intervention.id}
                    intervention={intervention}
                    onSuccess={refreshData}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
