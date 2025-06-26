"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Button from "../ui/button/Button";
import ClientForm from "../forms/ClientForm";

interface ClientActionsProps {
  clientId: string;
}

export default function ClientActions({ clientId }: ClientActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDeleteClient = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          router.refresh();
        } else {
          const error = await response.json();
          console.error("Erreur lors de la suppression du client:", error);
          alert("Erreur lors de la suppression du client");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du client:", error);
        alert("Erreur lors de la suppression du client");
      } finally {
        setIsDeleting(false);
        setShowDropdown(false);
      }
    }
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        className="p-1 h-8 w-8"
        onClick={toggleDropdown}
      >
        <MoreHorizontal size={16} />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="py-1">
            <div className="px-2 py-1">
              <ClientForm clientId={clientId} isEditing={true} />
            </div>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleDeleteClient}
              disabled={isDeleting}
            >
              <Trash2 size={16} className="mr-2" />
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
