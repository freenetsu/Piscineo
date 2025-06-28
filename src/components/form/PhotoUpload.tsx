"use client";

import { Camera, X } from "lucide-react";
import Image from "next/image";
import React, { useState, useRef } from "react";

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void;
  initialPhotos?: string[];
}

export default function PhotoUpload({
  onPhotosChange,
  initialPhotos = [],
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos: string[] = [];

      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const base64 = event.target.result as string;
            newPhotos.push(base64);

            // Si tous les fichiers ont été traités, mettre à jour l'état
            if (newPhotos.length === e.target.files!.length) {
              const updatedPhotos = [...photos, ...newPhotos];
              setPhotos(updatedPhotos);
              onPhotosChange(updatedPhotos);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative h-24 w-24 overflow-hidden rounded-md border border-gray-200"
          >
            <Image
              src={photo}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={triggerFileInput}
          className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center">
            <Camera size={20} className="text-gray-500" />
            <span className="mt-1 text-xs text-gray-500">Ajouter</span>
          </div>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        Formats acceptés: JPG, PNG. Max 5MB par image.
      </p>
    </div>
  );
}
