"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  FilePieChart,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Settings,
  UsersRound,
  Wallet,
  ChevronDown,
} from "lucide-react";

import { Header } from "@/components/header";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoansActive = pathname.startsWith('/loans');
  const isSavingsActive = pathname.startsWith('/savings');

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold font-headline text-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M2 7v10M2 12h10M12 7v10M16 7v10M22 7v10M16 12h6"/></svg>
            <span className="group-data-[collapsible=icon]:hidden">CoopBank</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Members">
                  <Link href="/members">
                    <UsersRound />
                    <span>Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Shares">
                  <Link href="/shares">
                    <Landmark />
                    <span>Shares</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                     <SidebarMenuButton tooltip="Savings" isActive={isSavingsActive} className="justify-between w-full">
                        <div className="flex items-center gap-2">
                           <Wallet />
                           <span>Savings</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", "group-data-[collapsible=icon]:hidden")} />
                     </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="group-data-[collapsible=icon]:hidden pl-8 py-2 flex flex-col gap-2">
                      <Link href="/savings" className={cn("text-sm hover:text-primary", pathname === "/savings" && "text-primary font-semibold")}>All Deposits</Link>
                      <Link href="/savings/schemes" className={cn("text-sm hover:text-primary", pathname === "/savings/schemes" && "text-primary font-semibold")}>Saving Schemes</Link>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                     <SidebarMenuButton tooltip="Loans" isActive={isLoansActive} className="justify-between w-full">
                        <div className="flex items-center gap-2">
                           <HandCoins />
                           <span>Loans</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", "group-data-[collapsible=icon]:hidden")} />
                     </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="group-data-[collapsible=icon]:hidden pl-8 py-2 flex flex-col gap-2">
                      <Link href="/loans" className={cn("text-sm hover:text-primary", pathname === "/loans" && "text-primary font-semibold")}>All Loans</Link>
                      <Link href="/loans/schemes" className={cn("text-sm hover:text-primary", pathname === "/loans/schemes" && "text-primary font-semibold")}>Loan Schemes</Link>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Finance</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Accounting">
                  <Link href="#">
                    <BookOpenCheck />
                    <span>Accounting</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Reports">
                  <Link href="/reports">
                    <FilePieChart />
                    <span>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="#">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="group-data-[collapsible=icon]:hidden px-2 py-1">
                 <UserNav />
              </div>
              <div className="group-data-[collapsible=icon]:block hidden">
                <UserNav />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-screen w-full flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
