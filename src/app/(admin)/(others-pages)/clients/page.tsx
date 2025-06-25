import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
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
      <div className="space-y-6">
        <ComponentCard title="Liste des clients">
          <ClientsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
