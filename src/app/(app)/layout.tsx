
import { Header } from "@/components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <div className="flex-1 overflow-y-auto bg-background">
        {children}
      </div>
    </div>
  );
}
