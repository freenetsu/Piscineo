import { Client, Intervention } from "@prisma/client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { sendEmail } from "./email";
import { formatDate } from "./utils";

// Interface pour les données d'intervention enrichies
interface InterventionWithClient extends Intervention {
  client: Client;
}

/**
 * Interface pour les données d'intervention utilisées dans le PDF
 */
interface PDFInterventionData {
  id: string;
  description: string;
  date: string;
  nextVisit?: string;
  notes?: string;
  photos?: string;
  signature?: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
}

/**
 * Génère un PDF simple pour une intervention
 */
async function generateSimplePDF(
  data: PDFInterventionData,
): Promise<Uint8Array> {
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Marges et positions
  const margin = 50;
  let y = height - margin;
  const lineHeight = 20;

  // Titre
  page.drawText("RAPPORT D'INTERVENTION", {
    x: margin,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0.7),
  });
  y -= lineHeight * 1.5;

  // Référence et date
  page.drawText(`Référence: ${data.id}`, {
    x: margin,
    y,
    size: 12,
    font,
  });
  y -= lineHeight;

  page.drawText(`Date: ${formatDate(new Date(data.date))}`, {
    x: margin,
    y,
    size: 12,
    font,
  });
  y -= lineHeight * 2;

  // Informations client
  page.drawText("INFORMATIONS CLIENT", {
    x: margin,
    y,
    size: 14,
    font: boldFont,
  });
  y -= lineHeight * 1.2;

  page.drawText(`Nom: ${data.client.firstName} ${data.client.lastName}`, {
    x: margin,
    y,
    size: 11,
    font,
  });
  y -= lineHeight;

  page.drawText(`Email: ${data.client.email || "-"}`, {
    x: margin,
    y,
    size: 11,
    font,
  });
  y -= lineHeight;

  page.drawText(`Téléphone: ${data.client.phone || "-"}`, {
    x: margin,
    y,
    size: 11,
    font,
  });
  y -= lineHeight;

  page.drawText(`Adresse: ${data.client.address || "-"}`, {
    x: margin,
    y,
    size: 11,
    font,
  });
  y -= lineHeight * 2;

  // Détails de l'intervention
  page.drawText("DÉTAILS DE L'INTERVENTION", {
    x: margin,
    y,
    size: 14,
    font: boldFont,
  });
  y -= lineHeight * 1.2;

  // Description (avec gestion du texte long)
  const descriptionLines = splitTextToLines(
    data.description,
    font,
    11,
    width - margin * 2,
  );
  for (const line of descriptionLines) {
    page.drawText(line, {
      x: margin,
      y,
      size: 11,
      font,
    });
    y -= lineHeight;
  }
  y -= lineHeight;

  // Prochaine visite
  if (data.nextVisit) {
    page.drawText(`Prochaine visite: ${formatDate(new Date(data.nextVisit))}`, {
      x: margin,
      y,
      size: 11,
      font,
    });
    y -= lineHeight;
  }

  // Notes
  if (data.notes) {
    y -= lineHeight;
    page.drawText("Notes:", {
      x: margin,
      y,
      size: 11,
      font: boldFont,
    });
    y -= lineHeight;

    const notesLines = splitTextToLines(
      data.notes,
      font,
      11,
      width - margin * 2,
    );
    for (const line of notesLines) {
      page.drawText(line, {
        x: margin,
        y,
        size: 11,
        font,
      });
      y -= lineHeight;
    }
  }

  // Pied de page
  const footerY = margin + 30;
  page.drawText("Ce document a été généré automatiquement par Piscineo.", {
    x: margin,
    y: footerY,
    size: 9,
    font,
  });

  page.drawText(
    `© ${new Date().getFullYear()} Piscineo - Tous droits réservés`,
    {
      x: margin,
      y: footerY - lineHeight,
      size: 9,
      font,
    },
  );

  return pdfDoc.save();
}

/**
 * Divise un texte long en lignes selon la largeur disponible
 */
function splitTextToLines(
  text: string,
  font: { widthOfTextAtSize: (text: string, size: number) => number },
  fontSize: number,
  maxWidth: number,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);

    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Génère un PDF à partir d'une intervention et l'envoie par email au client
 */
export async function generateAndSendInterventionPDF(
  intervention: InterventionWithClient,
): Promise<boolean> {
  try {
    // S'assurer que l'email du client existe
    if (!intervention.client.email) {
      console.error(
        "Impossible d'envoyer le PDF : l'email du client est manquant",
      );
      return false;
    }

    // Préparer les données pour le PDF
    const pdfData: PDFInterventionData = {
      id: intervention.id,
      description: intervention.description,
      date: intervention.date.toISOString(),
      nextVisit: intervention.nextVisit
        ? intervention.nextVisit.toISOString()
        : undefined,
      notes: intervention.notes || undefined,
      photos: intervention.photos as string | undefined,
      signature: intervention.signature || undefined,
      client: {
        firstName: intervention.client.firstName,
        lastName: intervention.client.lastName,
        email: intervention.client.email, // On a déjà vérifié qu'il n'est pas null
        phone: intervention.client.phone || "", // Valeur par défaut si null
        address: intervention.client.address,
      },
    };

    // Générer le PDF simple avec pdf-lib
    const pdfBytes = await generateSimplePDF(pdfData);
    const pdfBuffer = Buffer.from(pdfBytes);

    // Préparer l'email
    const emailSubject = `Rapport d'intervention Piscineo - ${formatDate(intervention.date)}`;
    const emailText = `
      Bonjour ${intervention.client.firstName} ${intervention.client.lastName},

      Veuillez trouver ci-joint le rapport de l'intervention réalisée le ${formatDate(intervention.date)}.

      Nous vous remercions pour votre confiance.

      L'équipe Piscineo
    `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Rapport d'intervention Piscineo</h2>
        <p>Bonjour ${intervention.client.firstName} ${intervention.client.lastName},</p>
        <p>Veuillez trouver ci-joint le rapport de l'intervention réalisée le ${formatDate(intervention.date)}.</p>
        <p>Nous vous remercions pour votre confiance.</p>
        <p>L'équipe Piscineo</p>
      </div>
    `;

    // Formater le nom du fichier PDF avec le nom du client et la date
    const formattedDate = formatDate(intervention.date).replace(/\//g, '-');
    const clientName = `${intervention.client.lastName}_${intervention.client.firstName}`.replace(/\s+/g, '_');
    const pdfFilename = `rapport_intervention_${clientName}_${formattedDate}.pdf`;
    
    // Envoyer l'email avec le PDF en pièce jointe
    const result = await sendEmail({
      to: intervention.client.email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    return result;
  } catch (error) {
    console.error("Erreur lors de la génération et de l'envoi du PDF:", error);
    return false;
  }
}
