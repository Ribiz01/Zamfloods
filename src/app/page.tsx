import { DashboardHeader } from "@/components/dashboard-header";
import { ForecastCard } from "@/components/forecast-card";
import { AlertsPanel } from "@/components/alerts-panel";
import { DataSummary } from "@/components/data-summary";
import { AuditTrail } from "@/components/audit-trail";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2 grid auto-rows-max gap-4">
            <ForecastCard />
          </div>
          <div className="flex flex-col gap-4">
            <DataSummary />
            <AlertsPanel />
            <AuditTrail />
          </div>
        </div>
      </main>
    </div>
  );
}
