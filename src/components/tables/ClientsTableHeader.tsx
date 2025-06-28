"use client";

import React from "react";
import ClientForm from "../forms/ClientForm";

export default function ClientsTableHeader() {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 p-5 dark:border-gray-800">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        Liste des clients
      </h4>
      <div className="flex items-center gap-2">
        <ClientForm />
      </div>
    </div>
  );
}
