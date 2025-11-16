import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { CalendarCard } from "@/components/dashboard/calendar-card";
import { FinancialStatements } from "@/components/dashboard/financial-statements";

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
        <RecentTransactions />
        <div className="grid gap-4 md:gap-8">
          <CalendarCard />
          <FinancialStatements />
        </div>
      </div>
    </main>
  );
}
