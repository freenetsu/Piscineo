"use client";

import React, { useState } from "react";
import { TableCell, TableRow } from "../ui/table";
import { Calendar, MapPin, FileText, Eye, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Client {
  firstName: string;
  lastName: string;
  address: string;
}

interface Intervention {
  id: string;
  clientId: string;
  client: Client;
  description: string;
  date: Date;
  nextVisit: Date | null;
  createdAt: Date;
}

interface InterventionsTableRowProps {
  intervention: Intervention;
  onSuccess?: () => void;
}

export default function InterventionsTableRow({ intervention, onSuccess }: InterventionsTableRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteIntervention = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette intervention ?")) {
      setIsDeleting(true);
      try {
        console.log("Tentative de suppression de l'intervention avec ID:", intervention.id);
        
        // Utiliser l'URL complète pour éviter les problèmes de routage
        const url = `/api/interventions/${encodeURIComponent(intervention.id)}`;
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
            if (onSuccess) {
              onSuccess();
            } else {
              router.refresh();
            }
          }, 300);
        } else {
          console.error("Erreur lors de la suppression de l'intervention:", responseData);
          alert(`Erreur lors de la suppression de l'intervention: ${response.status} ${responseData?.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        console.error("Exception lors de la suppression de l'intervention:", error);
        alert(`Exception lors de la suppression de l'intervention: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Fonction pour formater les dates
  const formatDate = (date: Date | string | null): string => {
    if (!date) return "Non spécifié";
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(dateObj);
  };

  return (
    <TableRow>
      <TableCell className="px-5 py-4 text-start sm:px-6">
        <div className="flex items-center gap-1">
          <User size={14} />
          <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
            {intervention.client.firstName} {intervention.client.lastName}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <FileText size={14} />
          <span>{intervention.description.length > 50 ? 
            `${intervention.description.substring(0, 50)}...` : 
            intervention.description}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span>{intervention.client.address}</span>
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{formatDate(intervention.date)}</span>
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
        <Link 
          href={`/interventions/${intervention.id}`}
          className="text-blue-500 hover:text-blue-700 font-medium flex items-center justify-center"
        >
          <Eye size={18} className="mr-1" /> Voir détails intervention
        </Link>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-center text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center justify-center space-y-2">
          {/* TODO: Créer et implémenter le composant InterventionForm pour l'édition
              similaire à ClientForm avec les props suivantes:
              - interventionId: string
              - isEditing: boolean
              - onSuccess: () => void */}
          <button 
            onClick={handleDeleteIntervention}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            {isDeleting ? "..." : "Supprimer"}
          </button>
        </div>
      </TableCell>
      <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
        {intervention.nextVisit ? (
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatDate(intervention.nextVisit)}</span>
          </div>
        ) : (
          "-"
        )}
      </TableCell>
    </TableRow>
  );
}
