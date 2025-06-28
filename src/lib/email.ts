import nodemailer from 'nodemailer';

// Fonction pour créer un transporteur d'emails
function createTransporter() {
  // Configuration spécifique pour Gmail
  if (process.env.EMAIL_SERVER_HOST?.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER || 'user@example.com',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'password',
      },
      tls: {
        rejectUnauthorized: false // Utile en développement si vous avez des problèmes de certificat
      }
    });
  }
  
  // Configuration standard pour les autres services
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.example.com',
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER || 'user@example.com',
      pass: process.env.EMAIL_SERVER_PASSWORD || 'password',
    },
  });
}

// Interface pour les options d'email
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[];
}

// Fonction pour envoyer un email
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { to, subject, text, html, attachments } = options;
    
    // Créer un transporteur pour cet envoi
    const transporter = createTransporter();
    
    // Vérifier la configuration avant l'envoi
    console.log('Tentative d\'envoi d\'email à:', to);
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Piscineo <noreply@piscineo.com>',
      to,
      subject,
      text,
      html,
      attachments,
    });
    
    console.log('Email envoyé avec succès à:', to);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    console.log('Configuration email utilisée:', {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      user: process.env.EMAIL_SERVER_USER,
      from: process.env.EMAIL_FROM,
      // Ne pas afficher le mot de passe pour des raisons de sécurité
    });
    return false;
  }
}
