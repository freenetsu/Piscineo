"use client";

import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ className = "", ...props }) => {
  return (
    <textarea
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition-all duration-200 focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-primary ${className}`}
      {...props}
    />
  );
};
