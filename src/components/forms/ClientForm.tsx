"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { useModal } from "../../hooks/useModal";
import { Textarea } from "@/components/ui/textarea";


interface ClientFormProps {
  clientId?: string;
  isEditing?: boolean;
}

export default function ClientForm({ clientId, isEditing = false }: ClientFormProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    addressComment: "",
    accessCode: "",
    poolState: "",
    poolSize: "",
    poolType: "",
    serviceFrequency: "",
    notes: "",
  });
  
  // Récupérer les données du client si on est en mode édition
  useEffect(() => {
    if (isEditing && clientId && isOpen) {
      const fetchClientData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/clients/${clientId}`);
          if (response.ok) {
            const data = await response.json();
            setFormData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              address: data.address || "",
              addressComment: data.addressComment || "",
              accessCode: data.accessCode || "",
              poolState: data.poolState || "",
              poolSize: data.poolSize || "",
              poolType: data.poolType || "",
              serviceFrequency: data.serviceFrequency || "",
              notes: data.notes || "",
            });
          } else {
            console.error("Erreur lors de la récupération du client");
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du client:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchClientData();
    }
  }, [clientId, isEditing, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      console.error("Utilisateur non connecté");
      return;
    }

    try {
      let response;
      
      if (isEditing && clientId) {
        // Mise à jour d'un client existant
        response = await fetch(`/api/clients/${clientId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        // Création d'un nouveau client
        response = await fetch("/api/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            userId: session.user.id,
          }),
        });
      }

      if (response.ok) {
        closeModal();
        router.refresh(); // Rafraîchir la page pour afficher le client créé/modifié
      } else {
        const error = await response.json();
        console.error(`Erreur lors de ${isEditing ? "la modification" : "la création"} du client:`, error);
      }
    } catch (error) {
      console.error(`Erreur lors de ${isEditing ? "la modification" : "la création"} du client:`, error);
    }
  };

  return (
    <>
      {isEditing ? (
        <button 
          onClick={openModal} 
          className="text-blue-600 text-sm hover:text-blue-800 font-medium"
        >
          Modifier
        </button>
      ) : (
        <Button onClick={openModal} size="sm">
          Ajouter un client
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[500px]">
        <div className="relative w-full max-w-[500px] max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-4 lg:p-6 dark:bg-gray-900">
          <div className="px-2 pr-8">
            <h4 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
              {isEditing ? "Modifier le client" : "Ajouter un nouveau client"}
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {isEditing 
                ? "Modifiez les informations du client."
                : "Remplissez les informations pour créer un nouveau client."}
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="px-2 pb-2">
              {/* Informations personnelles */}
              <div className="mt-4">
                <h5 className="mb-3 text-base font-medium text-gray-800 dark:text-white/90">
                  Informations personnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Prénom</Label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nom</Label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Téléphone</Label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div className="mt-4">
                <h5 className="mb-3 text-base font-medium text-gray-800 dark:text-white/90">
                  Adresse
                </h5>

                <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Adresse complète</Label>
                    <Input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Commentaire d&apos;adresse</Label>
                    <Textarea
                      name="addressComment"
                      value={formData.addressComment}
                      onChange={handleChange}
                      placeholder="Instructions d'accès, particularités..."
                      className="h-16 resize-none"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Code d&apos;accès</Label>
                    <Input
                      type="text"
                      name="accessCode"
                      value={formData.accessCode}
                      onChange={handleChange}
                      placeholder="Code portail, digicode..."
                    />
                  </div>
                </div>
              </div>

              {/* Informations piscine */}
              <div className="mt-4">
                <h5 className="mb-3 text-base font-medium text-gray-800 dark:text-white/90">
                  Informations piscine
                </h5>

                <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>État de la piscine</Label>
                    <Input
                      type="text"
                      name="poolState"
                      value={formData.poolState}
                      onChange={handleChange}
                      placeholder="Bon état, nécessite entretien..."
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Dimensions</Label>
                    <Input
                      type="text"
                      name="poolSize"
                      value={formData.poolSize}
                      onChange={handleChange}
                      placeholder="Ex: 8m x 4m"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Type de piscine</Label>
                    <Input
                      type="text"
                      name="poolType"
                      value={formData.poolType}
                      onChange={handleChange}
                      placeholder="Enterrée, hors-sol..."
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Fréquence d&apos;entretien</Label>
                    <Input
                      type="text"
                      name="serviceFrequency"
                      value={formData.serviceFrequency}
                      onChange={handleChange}
                      placeholder="Hebdomadaire, mensuel..."
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Informations supplémentaires..."
                      className="h-16 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button size="sm" type="submit" disabled={isLoading}>
                {isLoading ? "Chargement..." : isEditing ? "Enregistrer" : "Créer le client"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
