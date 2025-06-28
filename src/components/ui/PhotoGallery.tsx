"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  editable?: boolean;
  onRemove?: (index: number) => void;
}

export default function PhotoGallery({
  photos,
  editable = false,
  onRemove,
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aucune photo disponible
        </p>
      </div>
    );
  }

  const handleOpenModal = (photo: string) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-md border border-gray-200 dark:border-gray-700"
            onClick={() => handleOpenModal(photo)}
          >
            <Image
              src={photo}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
            {editable && onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal pour afficher la photo en plein écran */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-2 top-2 rounded-full bg-black bg-opacity-50 p-1 text-white hover:bg-opacity-70"
              onClick={handleCloseModal}
            >
              <X size={20} />
            </button>
            <div className="relative h-[80vh] w-[80vw] max-w-4xl">
              <Image
                src={selectedPhoto}
                alt="Photo en plein écran"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
