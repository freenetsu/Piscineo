"use client";

import React, { useEffect, useState } from "react";

interface ProgressBarProps {
  isLoading: boolean;
  duration?: number; // Durée en millisecondes pour atteindre 100%
  className?: string;
}

/**
 * Composant de barre de progression qui simule une progression pendant le chargement
 */
export default function ProgressBar({ 
  isLoading, 
  duration = 5000, // 5 secondes par défaut
  className = "" 
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      // Réinitialiser la progression au début du chargement
      setProgress(0);
      
      // Incrémenter progressivement jusqu'à 90% (réserver les 10% restants pour la fin du chargement)
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Augmenter plus rapidement au début, puis ralentir vers la fin
          const increment = Math.max(0.5, (100 - prevProgress) / 20);
          const newProgress = prevProgress + increment;
          
          // Limiter à 90% pendant le chargement
          return newProgress > 90 ? 90 : newProgress;
        });
      }, duration / 100); // Diviser la durée totale en 100 étapes
    } else {
      // Si le chargement est terminé, aller à 100% puis réinitialiser
      setProgress(100);
      
      // Réinitialiser après une courte période
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, duration]);
  
  if (!isLoading && progress === 0) {
    return null; // Ne pas afficher si pas de chargement et barre réinitialisée
  }
  
  return (
    <div className={`w-full ${className}`}>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
