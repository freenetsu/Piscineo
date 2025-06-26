import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClientForm from "@/components/forms/ClientForm";
import ClientsTable from "@/components/tables/ClientsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liste Clients",
  description: "Liste Clients",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Liste Clients" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Clients
          </h1>
          <ClientForm />
        </div>
        <ComponentCard title="Liste des clients">
          <ClientsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
