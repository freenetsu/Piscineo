import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import ClientForm from "@/components/forms/ClientForm";
import { Calendar, Droplets, Mail, MapPin, Phone, Ruler, Key, FileText, Clock, User, ArrowLeft } from "lucide-react";

// Fonction pour formater les dates
function formatDate(date: Date | string | null): string {
  if (!date) return "Non spécifié";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}

// Récupérer les données du client
async function getClientData(clientId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }
  
  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
      userId: session.user.id,
      active: true,
    },
  });
  
  if (!client) {
    notFound();
  }
  
  return client;
}

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
  const client = await getClientData(params.id);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/clients" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={18} className="mr-1" />
          <span>Retour à la liste des clients</span>
        </Link>
        
        <div className="flex space-x-3">
          <ClientForm clientId={client.id} isEditing={true} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* En-tête avec nom du client */}
        <div className="bg-blue-600 dark:bg-blue-800 p-6">
          <h2 className="text-2xl font-bold text-white">
            {client.firstName} {client.lastName}
          </h2>
          <p className="text-blue-100 mt-1">Client depuis {formatDate(client.createdAt)}</p>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informations personnelles */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <User className="mr-2" size={20} />
                Informations personnelles
              </h3>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                {client.email && (
                  <div className="flex items-start">
                    <Mail className="text-gray-500 dark:text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-800 dark:text-white">{client.email}</p>
                    </div>
                  </div>
                )}
                
                {client.phone && (
                  <div className="flex items-start">
                    <Phone className="text-gray-500 dark:text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                      <p className="text-gray-800 dark:text-white">{client.phone}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <MapPin className="text-gray-500 dark:text-gray-400 mt-1 mr-3" size={18} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                    <p className="text-gray-800 dark:text-white">{client.address}</p>
                    {client.addressComment && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">
                        {client.addressComment}
                      </p>
                    )}
                  </div>
                </div>
                
                {client.accessCode && (
                  <div className="flex items-start">
                    <Key className="text-gray-500 dark:text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Code d&apos;accès</p>
                      <p className="text-gray-800 dark:text-white">{client.accessCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Informations sur la piscine */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Droplets className="mr-2" size={20} />
                Informations sur la piscine
              </h3>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                {client.poolType && (
                  <div className="flex items-start">
                    <div className="text-gray-500 dark:text-gray-400 mt-1 mr-3">
                      <Droplets size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Type de piscine</p>
                      <p className="text-gray-800 dark:text-white">{client.poolType}</p>
                    </div>
                  </div>
                )}
                
                {client.poolSize && (
                  <div className="flex items-start">
                    <Ruler className="text-gray-500 dark:text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dimensions</p>
                      <p className="text-gray-800 dark:text-white">{client.poolSize}</p>
                    </div>
                  </div>
                )}
                
                {client.poolState && (
                  <div className="flex items-start">
                    <div className="text-gray-500 dark:text-gray-400 mt-1 mr-3">
                      <span className="inline-block w-4 h-4 rounded-full bg-blue-500"></span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">État actuel</p>
                      <p className="text-gray-800 dark:text-white">{client.poolState}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Informations sur l&apos;entretien */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Clock className="mr-2" size={20} />
                Informations sur l&apos;entretien
              </h3>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                {client.serviceFrequency && (
                  <div className="flex items-start">
                    <Clock className="text-gray-500 dark:text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fréquence d&apos;entretien</p>
                      <p className="text-gray-800 dark:text-white">{client.serviceFrequency}</p>
                    </div>
                  </div>
                )}
                
                {client.lastService && (
                  <div className="flex items-start">
                    <Calendar className="text-gray-500 dark:text-gray-400 mt-1 mr-3" size={18} />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Dernière intervention</p>
                      <p className="text-gray-800 dark:text-white">{formatDate(client.lastService)}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Notes */}
            {client.notes && (
              <section>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <FileText className="mr-2" size={20} />
                  Notes
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                  <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{client.notes}</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
