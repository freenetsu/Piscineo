import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  MapPin,
  FileText,
  User,
  Phone,
  Mail,
  Clock,
  ArrowLeft,
  Image as ImageIcon,
  Edit as EditIcon,
} from "lucide-react";
import PhotoGallery from "@/components/ui/PhotoGallery";
import Image from "next/image";
import PDFDownloadButtonWrapper from "@/components/pdf/PDFDownloadButtonWrapper";
import { formatDate } from "@/lib/utils";

// Utilisation de la fonction formatDate importée depuis @/lib/utils

async function getInterventionDetails(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const intervention = await prisma.intervention.findFirst({
    where: {
      id,
      client: {
        userId: session.user.id,
      },
    },
    include: {
      client: true,
    },
  });

  return intervention;
}

export default async function InterventionDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const intervention = await getInterventionDetails(params.id);

  if (!intervention) {
    notFound();
  }

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Détails de l&apos;intervention
        </h1>
        <Link
          href="/interventions"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour à la liste
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Informations sur l'intervention */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Informations sur l&apos;intervention
          </h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar className="mr-2 mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Date de l&apos;intervention
                </p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {formatDate(intervention.date)}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <FileText className="mr-2 mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Description
                </p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {intervention.description}
                </p>
              </div>
            </div>

            {intervention.nextVisit && (
              <div className="flex items-start">
                <Clock className="mr-2 mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Prochaine visite
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {formatDate(intervention.nextVisit)}
                  </p>
                </div>
              </div>
            )}

            {intervention.notes && (
              <div className="flex items-start">
                <FileText className="mr-2 mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notes
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {intervention.notes}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <Calendar className="mr-2 mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Date de création
                </p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {formatDate(intervention.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations sur le client */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Informations sur le client
            </h2>
            <Link
              href={`/clients/${intervention.clientId}`}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              Voir détails client
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <User className="mr-2 mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nom</p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {intervention.client.firstName} {intervention.client.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <MapPin className="mr-2 mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Adresse
                </p>
                <p className="font-medium text-gray-800 dark:text-white/90">
                  {intervention.client.address}
                </p>
              </div>
            </div>

            {intervention.client.email && (
              <div className="flex items-start">
                <Mail className="mr-2 mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Email
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {intervention.client.email}
                  </p>
                </div>
              </div>
            )}

            {intervention.client.phone && (
              <div className="flex items-start">
                <Phone className="mr-2 mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Téléphone
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {intervention.client.phone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Photos de l'intervention */}
      {intervention.photos && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center">
            <ImageIcon className="mr-2 h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Photos de l&apos;intervention
            </h2>
          </div>
          
          <div className="mt-4">
            <PhotoGallery 
              photos={intervention.photos ? JSON.parse(intervention.photos as string) as string[] : []} 
            />
          </div>
        </div>
      )}
      
      {/* Signature du prestataire */}
      {intervention.signature && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center">
            <EditIcon className="mr-2 h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Signature du prestataire
            </h2>
          </div>
          
          <div className="mt-4 max-w-md">
            <div className="border border-gray-200 rounded-md p-4 bg-white">
              <Image 
                src={intervention.signature} 
                alt="Signature du prestataire" 
                width={400} 
                height={150} 
                className="object-contain w-full" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="mt-6 flex justify-end space-x-4">
        <Link
          href={`/interventions`}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:hover:bg-gray-700"
        >
          Retour
        </Link>
        
        {/* Bouton de téléchargement PDF */}
        <div className="ml-2">
          <PDFDownloadButtonWrapper 
            interventionData={JSON.stringify({
              ...intervention,
              date: intervention.date.toISOString(),
              nextVisit: intervention.nextVisit ? intervention.nextVisit.toISOString() : null,
              createdAt: intervention.createdAt.toISOString(),
              updatedAt: intervention.updatedAt.toISOString(),
            })} 
          />
        </div>
      </div>
    </div>
  );
}
