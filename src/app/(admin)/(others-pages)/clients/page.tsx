import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ClientsTable from "@/components/tables/ClientsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clients",
  description: "Gestion des clients",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Clients" />
      <div className="space-y-4">
        <ComponentCard>
          <ClientsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
