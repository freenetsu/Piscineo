"use client";

import React from 'react';
import PDFDownloadButton from './PDFDownloadButton';

interface PDFDownloadButtonWrapperProps {
  interventionData: string; // JSON stringifié des données d'intervention
}

const PDFDownloadButtonWrapper: React.FC<PDFDownloadButtonWrapperProps> = ({ interventionData }) => {
  const intervention = JSON.parse(interventionData);
  
  return <PDFDownloadButton intervention={intervention} />;
};

export default PDFDownloadButtonWrapper;
