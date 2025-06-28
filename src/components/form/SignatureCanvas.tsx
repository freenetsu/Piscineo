"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Save, Edit } from "lucide-react";
import Image from "next/image";

interface SignatureCanvasProps {
  onSignatureChange: (signature: string | null) => void;
  initialSignature?: string | null;
}

export default function SignatureCanvas({
  onSignatureChange,
  initialSignature = null,
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  // Toujours montrer la prévisualisation
  const [showPreview, setShowPreview] = useState(true);
  const [currentSignature, setCurrentSignature] = useState<string | null>(initialSignature);

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Définir la taille du canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Configurer le style du trait
    context.lineWidth = 2;
    context.lineCap = "round";
    context.strokeStyle = "#000";

    // Effacer le canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Si une signature initiale est fournie, l'afficher
    if (initialSignature && !hasSignature) {
      const img = new window.Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
        setHasSignature(true);
        setCurrentSignature(initialSignature);
      };
      img.src = initialSignature;
    }
  }, [initialSignature, hasSignature]);

  // Gérer le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Sauvegarder le contenu actuel
      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");
      if (!tempContext) return;

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempContext.drawImage(canvas, 0, 0);

      // Redimensionner le canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Restaurer le contenu
      const context = canvas.getContext("2d");
      if (!context) return;
      context.lineWidth = 2;
      context.lineCap = "round";
      context.strokeStyle = "#000";
      context.drawImage(tempCanvas, 0, 0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fonctions de dessin
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Passer en mode édition si on commence à dessiner
    setShowPreview(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    setIsDrawing(true);
    setHasSignature(true);

    // Obtenir les coordonnées
    let x, y;
    if ("touches" in e) {
      // Événement tactile
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Événement souris
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Obtenir les coordonnées
    let x, y;
    if ("touches" in e) {
      // Événement tactile
      e.preventDefault(); // Empêcher le défilement sur mobile
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Événement souris
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.closePath();
    
    // Convertir la signature en base64 et la passer au parent
    const signatureData = canvas.toDataURL("image/png");
    setCurrentSignature(signatureData);
    onSignatureChange(signatureData);
    
    // Passer automatiquement en mode prévisualisation après avoir terminé de dessiner
    setShowPreview(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setCurrentSignature(null);
    onSignatureChange(null);
    setShowPreview(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL("image/png");
    setCurrentSignature(signatureData);
    onSignatureChange(signatureData);
    setShowPreview(true);
  };

  return (
    <div className="w-full">
      {showPreview ? (
        <div className="relative">
          <div className="w-full h-32 border border-gray-300 rounded-md bg-white relative">
            {currentSignature ? (
              <Image 
                src={currentSignature} 
                alt="Signature" 
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Aucune signature
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700"
            title="Modifier la signature"
          >
            <Edit size={16} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-32 border border-gray-300 rounded-md bg-white touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              type="button"
              onClick={clearSignature}
              className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
              title="Effacer la signature"
            >
              <X size={16} />
            </button>
            {hasSignature && (
              <button
                type="button"
                onClick={saveSignature}
                className="bg-green-600 text-white p-1 rounded-full hover:bg-green-700"
                title="Enregistrer la signature"
              >
                <Save size={16} />
              </button>
            )}
          </div>
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {showPreview
          ? "Cliquez sur l'icône X pour modifier la signature"
          : "Signez dans la zone ci-dessus"}
      </p>
    </div>
  );
}
