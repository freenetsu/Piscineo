import { Client, Intervention } from "@prisma/client";
import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import { sendEmail } from "./email";
import { formatDate } from "./utils";

// Palette de couleurs professionnelle
const COLORS = {
  primary: rgb(0.1, 0.4, 0.6),     // Bleu piscine
  secondary: rgb(0.2, 0.6, 0.8),   // Bleu clair
  accent: rgb(0.05, 0.3, 0.5),     // Bleu foncé
  text: rgb(0.2, 0.2, 0.2),        // Gris foncé pour le texte
  lightText: rgb(0.5, 0.5, 0.5),   // Gris clair pour le texte secondaire
  lightGrey: rgb(0.7, 0.7, 0.7),   // Gris clair pour les pieds de page
  background: rgb(0.95, 0.95, 0.95), // Gris très clair pour les fonds
  white: rgb(1, 1, 1),             // Blanc
  border: rgb(0.8, 0.8, 0.8)        // Gris clair pour les bordures
};

// Fonction pour dessiner un en-tête de section avec style moderne
function drawSectionHeader(page: PDFPage, title: string, x: number, y: number, width: number, font: PDFFont, boldFont: PDFFont): number {
  // Dessiner un fond de section avec dégradé (simulation avec rectangle)
  page.drawRectangle({
    x: x - 10,
    y: y - 30,
    width: width + 20,
    height: 40,
    color: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    opacity: 0.8,
  });

  // Dessiner le titre
  page.drawText(title, {
    x: x + 10,
    y: y - 20,
    size: 14,
    font: boldFont,
    color: COLORS.primary
  });

  // Dessiner une ligne de séparation
  page.drawLine({
    start: { x: x - 10, y: y - 32 },
    end: { x: x + width + 10, y: y - 32 },
    thickness: 1,
    color: COLORS.secondary,
    opacity: 0.5
  });

  return y - 45; // Retourner la nouvelle position Y
}

// Fonction pour dessiner un champ d'information avec étiquette et valeur
function drawInfoField(page: PDFPage, label: string, value: string, x: number, y: number, font: PDFFont, boldFont: PDFFont): number {
  // Étiquette en gras
  page.drawText(label + " : ", {
    x,
    y,
    size: 10,
    font: boldFont,
    color: COLORS.text
  });
  
  // Valeur
  const labelWidth = 80; // Largeur approximative de l'étiquette
  page.drawText(value, {
    x: x + labelWidth,
    y,
    size: 10,
    font: font,
    color: COLORS.text
  });
  
  return y - 20; // Espacement standard entre les champs
}

// Fonction pour dessiner un cadre avec bordure
function drawBox(page: PDFPage, x: number, y: number, width: number, height: number): void {
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    borderColor: COLORS.border,
    borderWidth: 0.5,
    color: COLORS.white
  });
}

/**
 * Dessine un pied de page professionnel avec logo et copyright
 */
async function drawProfessionalFooter(
  page: PDFPage, 
  pdfDoc: PDFDocument,
  font: PDFFont,
  y: number,
  width: number,
  logoBase64?: string
) {
  const currentYear = new Date().getFullYear();
  const footerText = `© ${currentYear} Piscineo - Tous droits réservés`;
  const generatedText = "Document généré automatiquement";
  
  // Dessiner une ligne horizontale fine
  page.drawLine({
    start: { x: 50, y: y + 15 },
    end: { x: width - 50, y: y + 15 },
    thickness: 0.5,
    color: COLORS.lightGrey
  });
  
  // Ajouter le texte de copyright
  page.drawText(footerText, {
    x: 50,
    y: y,
    size: 9,
    font,
    color: COLORS.lightGrey
  });
  
  // Ajouter le texte "Document généré automatiquement"
  page.drawText(generatedText, {
    x: width - 50 - font.widthOfTextAtSize(generatedText, 9),
    y: y,
    size: 9,
    font,
    color: COLORS.lightGrey
  });
  
  // Si un logo est fourni, l'ajouter au centre
  if (logoBase64) {
    try {
      const logoBytes = await base64ImageToUint8Array(logoBase64);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.3); // Réduire la taille du logo
      
      page.drawImage(logoImage, {
        x: width / 2 - logoDims.width / 2,
        y: y - 5,
        width: logoDims.width,
        height: logoDims.height
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout du logo au pied de page:", error);
      // Continuer sans logo en cas d'erreur
    }
  }
}

// Fonction pour convertir une image base64 en Uint8Array
async function base64ImageToUint8Array(base64Image: string): Promise<Uint8Array> {
  // Supprimer le préfixe data:image/...;base64, s'il existe
  const base64Data = base64Image.split(',')[1] || base64Image;
  // Convertir en Uint8Array
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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
 * Génère un PDF professionnel pour une intervention
 */
export async function generateInterventionPDF(data: PDFInterventionData): Promise<Uint8Array> {
  // Créer un nouveau document PDF
  const pdfDoc = await PDFDocument.create();
  
  // Ajouter une page
  const page = pdfDoc.addPage();
  
  // Dimensions de la page
  const { width, height } = page.getSize();
  const margin = 50;
  const lineHeight = 20;
  
  // Charger les polices - utiliser Helvetica pour une typographie sans-serif élégante
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Position Y initiale (haut de la page)
  let y = height - margin;
  
  // En-tête du document avec style moderne
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: COLORS.primary
  });
  
  // Titre du document
  page.drawText("RAPPORT D'INTERVENTION", {
    x: margin,
    y: height - 60,
    size: 24,
    font: boldFont,
    color: COLORS.white
  });
  
  // Date de l'intervention dans l'en-tête
  page.drawText(`Date: ${formatDate(new Date(data.date))}`, {
    x: margin,
    y: height - 85,
    size: 12,
    font: font,
    color: COLORS.white
  });
  
  // Numéro d'intervention à droite
  const interventionIdText = `Réf: ${data.id.substring(0, 8)}`;
  const interventionIdWidth = boldFont.widthOfTextAtSize(interventionIdText, 12);
  page.drawText(interventionIdText, {
    x: width - margin - interventionIdWidth,
    y: height - 85,
    size: 12,
    font: boldFont,
    color: COLORS.white
  });
  
  // Début du contenu principal
  y = height - 120;
  
  // Informations du client avec style amélioré
  y = drawSectionHeader(page, "INFORMATIONS CLIENT", margin, y, width - margin * 2, font, boldFont);
  
  // Cadre pour les informations client
  drawBox(page, margin, y, width - margin * 2, 100);
  
  // Informations client dans un format plus structuré
  y -= 20;
  y = drawInfoField(page, "Client", `${data.client.lastName} ${data.client.firstName}`, margin + 10, y, font, boldFont);
  y = drawInfoField(page, "Adresse", data.client.address, margin + 10, y, font, boldFont);
  y = drawInfoField(page, "Téléphone", data.client.phone, margin + 10, y, font, boldFont);
  y = drawInfoField(page, "Email", data.client.email, margin + 10, y, font, boldFont);
  
  y -= 20; // Espace après le cadre client
  
  // Détails de l'intervention avec style amélioré
  y = drawSectionHeader(page, "DÉTAILS DE L'INTERVENTION", margin, y, width - margin * 2, font, boldFont);
  
  // Cadre pour la description
  drawBox(page, margin, y, width - margin * 2, 120);
  
  // Description avec titre en couleur
  y -= 20;
  page.drawText("Description:", {
    x: margin + 10,
    y,
    size: 12,
    font: boldFont,
    color: COLORS.accent
  });
  y -= lineHeight;
  
  // Texte multiligne pour la description avec meilleure mise en forme
  const descriptionLines = splitTextToLines(data.description, font, 11, width - margin * 2 - 30);
  for (const line of descriptionLines) {
    page.drawText(line, {
      x: margin + 15,
      y,
      size: 11,
      font: font,
      color: COLORS.text
    });
    y -= lineHeight;
  }
  
  y -= 10; // Espace après la description
  
  // Notes additionnelles avec style amélioré
  if (data.notes) {
    // Cadre pour les notes
    drawBox(page, margin, y, width - margin * 2, 80);
    
    y -= 20;
    page.drawText("Notes:", {
      x: margin + 10,
      y,
      size: 12,
      font: boldFont,
      color: COLORS.accent
    });
    y -= lineHeight;
    
    const notesLines = data.notes.split('\n');
    for (const line of notesLines) {
      page.drawText(line, {
        x: margin + 15,
        y,
        size: 11,
        font: italicFont,
        color: COLORS.text
      });
      y -= lineHeight;
    }
    
    y -= 10; // Espace après les notes
  }
  
  // Prochaine visite avec mise en valeur
  if (data.nextVisit) {
    // Cadre pour la prochaine visite
    drawBox(page, margin, y, width - margin * 2, 40);
    
    y -= 25;
    const nextVisitText = `Prochaine visite prévue: ${formatDate(new Date(data.nextVisit))}`;
    page.drawText(nextVisitText, {
      x: margin + 10,
      y,
      size: 12,
      font: boldFont,
      color: COLORS.secondary
    });
    
    y -= lineHeight * 2;
  }
  
  // Ajouter un lien vers les photos sur la première page
  let photos: string[] = [];
  if (data.photos) {
    try {
      photos = JSON.parse(data.photos);
    } catch (error) {
      console.error("Erreur lors du parsing des photos:", error);
    }
  }
  
  if (photos.length > 0) {
    y -= lineHeight * 2;
    page.drawText("Des photos sont disponibles sur la page suivante", {
      x: margin,
      y,
      size: 12,
      font: font,
      color: rgb(0.3, 0.3, 0.8),
    });
    y -= lineHeight;
    
    // Créer une nouvelle page pour les photos
    const photosPage = pdfDoc.addPage([width, height]);
    let photosY = height - margin;
    
    // Titre de la page de photos
    photosPage.drawText("RAPPORT D'INTERVENTION - PHOTOS", {
      x: margin,
      y: photosY,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0.8),
    });
    photosY -= lineHeight * 2;
    
    // Sous-titre avec le nom du client et la date
    photosPage.drawText("Client: " + data.client.firstName + " " + data.client.lastName + " - Date: " + formatDate(new Date(data.date)), {
      x: margin,
      y: photosY,
      size: 12,
      font: font,
    });
    photosY -= lineHeight * 2;
    
    // Limiter à 4 photos maximum pour éviter de surcharger le PDF
    const maxPhotos = Math.min(4, photos.length);
    console.log(`Traitement de ${maxPhotos} photos sur ${photos.length} disponibles`);
    
    try {
      // Calculer la disposition des photos - plus grandes sur leur propre page
      const photoWidth = (width - margin * 2 - 20) / 2; // 2 photos par ligne
      const photoHeight = photoWidth * 0.75; // Ratio 4:3
      
      for (let i = 0; i < maxPhotos; i++) {
        console.log(`Traitement de la photo ${i+1}/${maxPhotos}`);
        // La colonne détermine la position horizontale (0 = gauche, 1 = droite)
        const col = i % 2;
        
        try {
          // Vérifier que la photo existe et n'est pas vide
          if (!photos[i] || photos[i].trim() === '') {
            console.warn(`Photo ${i} est vide ou invalide, ignorée`);
            continue;
          }
          
          // Convertir l'image base64 en Uint8Array
          const photoBytes = await base64ImageToUint8Array(photos[i]);
          
          // Intégrer l'image dans le PDF - essayer d'abord en JPG, puis en PNG si ça échoue
          let photoImage;
          try {
            photoImage = await pdfDoc.embedJpg(photoBytes);
          } catch (jpgError) {
            console.log(`Erreur JPG, essai en PNG pour la photo ${i}: ${jpgError instanceof Error ? jpgError.message : 'Erreur inconnue'}`);
            try {
              photoImage = await pdfDoc.embedPng(photoBytes);
            } catch (pngError) {
              console.error(`Impossible d'intégrer l'image ${i} ni en JPG ni en PNG: ${pngError instanceof Error ? pngError.message : 'Erreur inconnue'}`);
              continue; // Passer à la photo suivante au lieu de lancer une exception
            }
          }
          
          // Calculer la position de l'image
          const xPos = margin + col * (photoWidth + 20);
          const yPos = photosY - photoHeight;
          
          // Dessiner l'image
          photosPage.drawImage(photoImage, {
            x: xPos,
            y: yPos,
            width: photoWidth,
            height: photoHeight,
          });
          
          // Légende de la photo
          const legendY = yPos - 15;
          photosPage.drawText(`Photo ${i+1}`, {
            x: xPos,
            y: legendY,
            size: 10,
            font: font,
          });
          
          // Ajuster photosY seulement après chaque ligne complète ou à la dernière image
          if (col === 1 || i === maxPhotos - 1) {
            photosY -= photoHeight + lineHeight * 2; // Plus d'espace entre les lignes
          }
          
          console.log(`Photo ${i+1} intégrée avec succès`);
        } catch (error) {
          console.error(`Erreur lors de l'intégration de la photo ${i}:`, error);
        }
      }
      
      // Ajouter un pied de page à la page des photos
      const footerY = 40;
      await drawProfessionalFooter(photosPage, pdfDoc, font, footerY, width);
      
    } catch (error) {
      console.error("Erreur lors du traitement des photos:", error);
    }
  }
  
  // Signature - Toujours sur une nouvelle page
  if (data.signature) {
    // Créer une nouvelle page pour la signature
    const signaturePage = pdfDoc.addPage();
    const { width: sigWidth, height: sigHeight } = signaturePage.getSize();
    
    // Titre de la page avec style cohérent
    const sigY = sigHeight - margin;
    const newSigY = drawSectionHeader(signaturePage, "Signature", margin, sigY, sigWidth - margin * 2, font, boldFont);
    
    // Convertir l'image base64 en Uint8Array
    const signatureBytes = await base64ImageToUint8Array(data.signature);
    
    // Déterminer si c'est un PNG ou un JPEG
    let signatureImage;
    if (data.signature.includes('image/png')) {
      signatureImage = await pdfDoc.embedPng(signatureBytes);
    } else {
      signatureImage = await pdfDoc.embedJpg(signatureBytes);
    }
    
    // Calculer les dimensions pour l'affichage
    const signatureDims = signatureImage.scale(0.5); // Réduire la taille de 50%
    
    // Dessiner l'image de signature
    signaturePage.drawImage(signatureImage, {
      x: sigWidth / 2 - signatureDims.width / 2, // Centrer horizontalement
      y: newSigY - signatureDims.height, // Position Y sous le titre
      width: signatureDims.width,
      height: signatureDims.height,
    });
    
    // Ajouter la date de signature
    const signatureDate = `Signé le ${formatDate(new Date(data.date))}`;
    signaturePage.drawText(signatureDate, {
      x: sigWidth / 2 - boldFont.widthOfTextAtSize(signatureDate, 12) / 2, // Centrer
      y: newSigY - signatureDims.height - 30,
      size: 12,
      font: italicFont,
      color: COLORS.text
    });
    
    // Ajouter un pied de page professionnel à la page de signature
    await drawProfessionalFooter(signaturePage, pdfDoc, font, 40, sigWidth);
    
  }

  // Ajouter un pied de page professionnel à la page principale
  await drawProfessionalFooter(page, pdfDoc, font, 40, width);

  return pdfDoc.save();
}

/**
 * Fonction pour diviser un texte long en lignes
 */
function splitTextToLines(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
): string[] {
  // Gestion des sauts de ligne explicites
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  
  // Traiter chaque paragraphe séparément
  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }
    
    const words = paragraph.split(" ");
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
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

    // Générer le PDF professionnel avec pdf-lib
    const pdfBytes = await generateInterventionPDF(pdfData);
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

export async function generatePDF(data: PDFInterventionData): Promise<Uint8Array> {
  try {
    return await generateInterventionPDF(data);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error;
  }
}
