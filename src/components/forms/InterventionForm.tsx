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
import { Calendar } from "lucide-react";
import PhotoUpload from "../form/PhotoUpload";
import SignatureCanvas from "../form/SignatureCanvas";

interface InterventionFormProps {
  interventionId?: string;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export default function InterventionForm({ interventionId, isEditing = false, onSuccess }: InterventionFormProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  interface Client {
    id: string;
    firstName: string;
    lastName: string;
  }
  
  const [clients, setClients] = useState<Client[]>([]);

  const [formData, setFormData] = useState({
    clientId: "",
    description: "",
    date: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD pour aujourd'hui
    nextVisit: "",
    notes: "",
    checklist: JSON.stringify([]), // Initialiser avec un tableau vide pour le checklist obligatoire
  });
  
  // État pour l'option d'envoi automatique du PDF par email
  const [sendPdfToClient, setSendPdfToClient] = useState(false);
  
  // État pour stocker les photos en base64
  const [photos, setPhotos] = useState<string[]>([]);
  
  // État pour stocker la signature en base64
  const [signature, setSignature] = useState<string | null>(null);
  
  // Récupérer les clients de l'utilisateur connecté
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      const fetchClients = async () => {
        try {
          // Ajouter le paramètre activeOnly=true pour ne récupérer que les clients actifs
          const response = await fetch('/api/clients?activeOnly=true');
          if (response.ok) {
            const data = await response.json();
            setClients(data);
            
            // Si c'est un nouveau formulaire et qu'il y a des clients, sélectionner le premier par défaut
            if (!isEditing && data.length > 0 && !formData.clientId) {
              setFormData(prev => ({
                ...prev,
                clientId: data[0].id
              }));
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des clients:", error);
        }
      };
      
      fetchClients();
    }
  }, [isOpen, session?.user?.id, isEditing, formData.clientId]);

  // Récupérer les données de l'intervention si on est en mode édition
  useEffect(() => {
    if (isEditing && interventionId && isOpen) {
      const fetchIntervention = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/interventions/${interventionId}`);
          if (response.ok) {
            const data = await response.json();
            setFormData({
              clientId: data.clientId,
              description: data.description,
              date: new Date(data.date).toISOString().split('T')[0],
              nextVisit: data.nextVisit ? new Date(data.nextVisit).toISOString().split('T')[0] : "",
              notes: data.notes || "",
              checklist: data.checklist || JSON.stringify([]),
            });
            
            // Charger les photos si elles existent
            if (data.photos) {
              try {
                const parsedPhotos = JSON.parse(data.photos);
                setPhotos(Array.isArray(parsedPhotos) ? parsedPhotos : []);
              } catch (error) {
                console.error("Erreur lors du parsing des photos:", error);
                setPhotos([]);
              }
            }
            
            // Charger la signature si elle existe
            if (data.signature) {
              setSignature(data.signature);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'intervention:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchIntervention();
    }
  }, [isEditing, interventionId, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox" && name === "sendPdfToClient") {
      setSendPdfToClient((e.target as HTMLInputElement).checked);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.description) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        photos: photos.length > 0 ? JSON.stringify(photos) : undefined,
        signature: signature || undefined,
      };

      const url = isEditing
        ? `/api/interventions/${interventionId}`
        : "/api/interventions";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        const createdOrUpdatedId = isEditing ? interventionId : result.id;
        
        // Si l'option d'envoi du PDF est cochée, envoyer le PDF par email
        if (sendPdfToClient && createdOrUpdatedId) {
          try {
            console.log('Tentative d\'envoi du PDF pour l\'intervention:', createdOrUpdatedId);
            
            const pdfResponse = await fetch('/api/interventions/send-pdf', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ interventionId: createdOrUpdatedId }),
            });
            
            if (pdfResponse.ok) {
              const result = await pdfResponse.json();
              console.log('PDF envoyé avec succès au client:', result);
              alert('Le rapport d\'intervention a été envoyé par email au client.');
            } else {
              const errorData = await pdfResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
              console.error('Erreur lors de l\'envoi du PDF:', errorData);
              alert(`Erreur lors de l'envoi du PDF: ${errorData.error || 'Erreur inconnue'}`);
            }
          } catch (error) {
            console.error('Erreur lors de l\'envoi du PDF:', error);
            alert(`Erreur lors de l'envoi du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
          }
        }
        
        closeModal();
        if (onSuccess) onSuccess();
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Une erreur est survenue"}`);
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      alert("Une erreur est survenue lors de la soumission du formulaire");
    } finally {
      setIsLoading(false);
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
          Ajouter une intervention
        </Button>
      )}

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[500px]">
        <div className="relative w-full max-w-[500px] max-h-[80vh] overflow-y-auto rounded-3xl bg-white p-4 lg:p-6 dark:bg-gray-900">
          <div className="px-2 pr-8">
            <h4 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
              {isEditing ? "Modifier l&apos;intervention" : "Ajouter une nouvelle intervention"}
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {isEditing 
                ? "Modifiez les informations de l&apos;intervention."
                : "Remplissez les informations pour créer une nouvelle intervention."}
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="px-2 pb-2">
              {/* Informations de base */}
              <div className="mt-4">
                <h5 className="mb-3 text-base font-medium text-gray-800 dark:text-white/90">
                  Informations de l&apos;intervention
                </h5>

                <div className="grid grid-cols-1 gap-x-4 gap-y-3 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Client</Label>
                    <select
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionnez un client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Description de l&apos;intervention..."
                      className="h-20 resize-none"
                      required
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Date de l&apos;intervention</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                    </div>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Prochaine visite (optionnel)</Label>
                    <div className="relative">
                      <Input
                        type="date"
                        name="nextVisit"
                        value={formData.nextVisit}
                        onChange={handleChange}
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label>Notes supplémentaires</Label>
                    <Textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Informations supplémentaires..."
                      className="h-16 resize-none"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Photos de l&apos;intervention</Label>
                    <PhotoUpload 
                      onPhotosChange={setPhotos}
                      initialPhotos={photos}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Label>Signature du prestataire</Label>
                    <SignatureCanvas 
                      onSignatureChange={setSignature}
                      initialSignature={signature}
                    />
                  </div>
                  
                  {/* Option pour envoyer le PDF par email */}
                  <div className="col-span-2 mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sendPdfToClient"
                        name="sendPdfToClient"
                        checked={sendPdfToClient}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="sendPdfToClient" className="ml-2 block text-sm text-gray-700 dark:text-white/90">
                        Envoyer automatiquement le rapport d&apos;intervention par email au client
                      </label>
                    </div>
                  </div>

                  {/* Champ caché pour le checklist obligatoire */}
                  <input
                    type="hidden"
                    name="checklist"
                    value={formData.checklist}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button size="sm" type="submit" disabled={isLoading}>
                {isLoading ? "Chargement..." : isEditing ? "Enregistrer" : "Créer l'intervention"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
