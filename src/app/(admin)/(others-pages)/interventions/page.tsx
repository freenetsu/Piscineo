import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InterventionsTable from "@/components/tables/InterventionsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interventions",
  description: "Gestion des interventions",
  // other metadata
};

export default function InterventionsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Interventions" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {/* Nous ajouterons le formulaire de création d'intervention plus tard */}
          {/* <InterventionForm /> */}
        </div>
        <ComponentCard>
          <InterventionsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
