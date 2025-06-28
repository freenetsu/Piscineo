"use client";

import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileText, Loader2 } from 'lucide-react';
import InterventionPDF from './InterventionPDF';
import Button from '../ui/button/Button';

interface PDFDownloadButtonProps {
  intervention: {
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
  };
  buttonText?: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ 
  intervention, 
  buttonText = "Télécharger le PDF" 
}) => {
  const [isClient, setIsClient] = useState(false);

  // Utiliser useEffect pour s'assurer que le rendu se fait côté client
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Button size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InterventionPDF intervention={intervention} />}
      fileName={`intervention-${intervention.id}.pdf`}
      className="inline-block"
    >
      {({ loading }) => (
        <Button 
          size="sm" 
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {buttonText}
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default PDFDownloadButton;
