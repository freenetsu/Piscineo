"use client";

import React, { useState } from "react";
import { TableCell, TableRow } from "../ui/table";
import { Droplets, Mail, MapPin, Phone, Eye, Calendar } from "lucide-react";
import ClientForm from "../forms/ClientForm";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string;
  addressComment: string | null;
  accessCode: string | null;
  poolState: string | null;
  poolSize: string | null;
  active: boolean;
  createdAt: Date;
}

interface ClientsTableRowProps {
  client: Client;
}

export default function ClientsTableRow({ client }: ClientsTableRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClient = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      setIsDeleting(true);
      try {
        console.log("Tentative de suppression du client avec ID:", client.id);
        
        // Utiliser l'URL complète pour éviter les problèmes de routage
        const url = `/api/clients/${encodeURIComponent(client.id)}`;
        console.log("URL de suppression:", url);
        
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          // S'assurer que les cookies sont envoyés pour l'authentification
          credentials: "include",
        });
        
        console.log("Statut de la réponse:", response.status);
        const responseText = await response.text();
        console.log("Réponse brute:", responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error("Impossible de parser la réponse JSON:", e);
        }

        if (response.ok) {
          console.log("Suppression réussie, données:", responseData);
          // Attendre un court instant avant de rafraîchir pour s'assurer que les changements sont propagés
          setTimeout(() => {
            router.refresh();
          }, 300);
        } else {
          console.error("Erreur lors de la suppression du client:", responseData);
          alert(`Erreur lors de la suppression du client: ${response.status} ${responseData?.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        console.error("Exception lors de la suppression du client:", error);
        alert(`Exception lors de la suppression du client: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <TableRow>
      <TableCell className="px-5 py-4 text-start sm:px-6">
        <div className="flex flex-col">
          <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
            {client.firstName} {client.lastName}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
        <div className="flex flex-col gap-1">
          {client.email && (
            <div className="flex items-center gap-1">
              <Mail size={14} />
              <span>{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1">
              <Phone size={14} />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{client.address}</span>
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
        {client.poolState ? (
          <div className="flex items-center gap-1">
            <Droplets size={14} />
            <span>{client.poolState}</span>
          </div>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
        <Link 
          href={`/clients/${client.id}`}
          className="text-blue-500 hover:text-blue-700 font-medium flex items-center justify-center"
        >
          <Eye size={18} className="mr-1" /> Voir détails client
        </Link>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center justify-center space-y-2">
          <ClientForm clientId={client.id} isEditing={true} />
          <button 
            onClick={handleDeleteClient}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            {isDeleting ? "..." : "Supprimer"}
          </button>
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{new Date(client.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
