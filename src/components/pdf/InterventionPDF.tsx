"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { formatDate } from "@/lib/utils";

// Définir les styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #dddddd",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2563eb", // Bleu
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2563eb", // Bleu
    borderBottom: "1 solid #dddddd",
    paddingBottom: 5,
  },
  clientInfo: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
    color: "#333333",
  },
  value: {
    width: "70%",
    color: "#555555",
  },
  description: {
    marginBottom: 15,
    fontSize: 12,
    lineHeight: 1.5,
  },
  notes: {
    marginTop: 10,
    fontSize: 12,
    fontStyle: "italic",
    color: "#555555",
  },
  photosSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  photoContainer: {
    width: "33%",
    padding: 5,
    height: 120,
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  signatureSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  signatureContainer: {
    height: 100,
    marginTop: 10,
    border: "1 dashed #cccccc",
    padding: 5,
  },
  signature: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  footer: {
    marginTop: 30,
    borderTop: "1 solid #dddddd",
    paddingTop: 10,
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
  },
});

// Interface pour les propriétés du PDF
interface InterventionPDFProps {
  intervention: {
    id: string;
    description: string;
    date: string;
    nextVisit?: string;
    notes?: string;
    photos?: string; // JSON string d'un tableau de base64
    signature?: string; // base64 string
    client: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
    };
  };
}

// Composant PDF pour les interventions
const InterventionPDF: React.FC<InterventionPDFProps> = ({ intervention }) => {
  // Convertir les photos JSON en tableau
  const photos = intervention.photos
    ? JSON.parse(intervention.photos as string)
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>Rapport d&apos;intervention</Text>
          <Text style={styles.subtitle}>Référence: {intervention.id}</Text>
          <Text style={styles.subtitle}>
            Date: {formatDate(new Date(intervention.date))}
          </Text>
        </View>

        {/* Informations client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations client</Text>
          <View style={styles.clientInfo}>
            <View style={styles.row}>
              <Text style={styles.label}>Nom:</Text>
              <Text style={styles.value}>
                {intervention.client.firstName} {intervention.client.lastName}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{intervention.client.email}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Téléphone:</Text>
              <Text style={styles.value}>{intervention.client.phone}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>{intervention.client.address}</Text>
            </View>
          </View>
        </View>

        {/* Détails de l'intervention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Détails de l&apos;intervention
          </Text>
          <Text style={styles.description}>{intervention.description}</Text>

          {intervention.nextVisit && (
            <View style={styles.row}>
              <Text style={styles.label}>Prochaine visite:</Text>
              <Text style={styles.value}>
                {formatDate(new Date(intervention.nextVisit))}
              </Text>
            </View>
          )}

          {intervention.notes && (
            <View style={styles.notes}>
              <Text style={styles.label}>Notes:</Text>
              <Text>{intervention.notes}</Text>
            </View>
          )}
        </View>

        {/* Photos */}
        {photos.length > 0 && (
          <View style={styles.photosSection}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photosGrid}>
              {photos.slice(0, 6).map((photo: string, index: number) => (
                <View key={index} style={styles.photoContainer}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image src={photo} style={styles.photo} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Signature */}
        {intervention.signature && (
          <View style={styles.signatureSection}>
            <Text style={styles.sectionTitle}>Signature du prestataire</Text>
            <View style={styles.signatureContainer}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={intervention.signature} style={styles.signature} />
            </View>
          </View>
        )}

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Ce document a été généré automatiquement par Piscineo.</Text>
          <Text>
            © {new Date().getFullYear()} Piscineo - Tous droits réservés
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InterventionPDF;
