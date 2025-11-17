
"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  FilePieChart,
  HandCoins,
  LayoutDashboard,
  UsersRound,
  Wallet,
  Search,
  Globe,
  Menu,
  ChevronDown,
  Building,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

type NavItem = {
  href?: string;
  label: string;
  icon: React.ElementType;
  subItems?: Omit<NavItem, 'icon' | 'subItems'>[];
  paths?: string[];
};


const mainNavLinks: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, paths: ["/"] },
  { href: "/members", label: "Members", icon: UsersRound, paths: ["/members"] },
  { href: "/accounts", label: "Accounts", icon: Wallet, paths: ["/accounts"] },
  { href: "/shares", label: "Shares", icon: Building, paths: ["/shares"] },
  { 
    label: "Savings", 
    icon: Wallet, 
    paths: ['/savings', '/savings/schemes'],
    subItems: [
      { href: "/savings", label: "All Savings" },
      { href: "/savings/schemes", label: "Saving Schemes" },
    ]
  },
  { 
    label: "Loans", 
    icon: HandCoins, 
    paths: ['/loans', '/loans/schemes'],
    subItems: [
      { href: "/loans", label: "All Loans" },
      { href: "/loans/schemes", label: "Loan Schemes" },
    ] 
  },
  { 
    label: "Accounting", 
    icon: BookOpenCheck, 
    paths: ['/accounting/journals', '/accounting/chart-of-accounts'],
    subItems: [
        { href: "/accounting/journals", label: "Journal Entries" },
        { href: "/accounting/chart-of-accounts", label: "Chart of Accounts" },
    ]
  },
  { 
    label: "Reports", 
    icon: FilePieChart, 
    paths: ["/reports", "/reports/trial-balance", "/reports/profit-and-loss", "/reports/balance-sheet"],
    subItems: [
        { href: "/reports", label: "Financial Summary" },
        { href: "/reports/trial-balance", label: "Trial Balance" },
        { href: "/reports/profit-and-loss", label: "Profit & Loss" },
        { href: "/reports/balance-sheet", label: "Balance Sheet" },
    ] 
  },
];


const MainNav = ({ isMobile = false }: { isMobile?: boolean }) => {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = item.href === pathname || (item.paths && item.paths.some(p => pathname.startsWith(p)));

        if (item.subItems) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button
                            variant="ghost"
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 justify-start",
                                isActive ? "text-primary bg-accent" : "text-muted-foreground",
                                isMobile ? "text-lg p-2 h-auto w-full" : "p-2 h-auto"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className={cn(isMobile ? "" : "hidden md:inline")}>{item.label}</span>
                            <ChevronDown className="h-4 w-4 ml-auto" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {item.subItems.map((subItem) => (
                            <DropdownMenuItem key={subItem.href} asChild>
                                <Link href={subItem.href!}>{subItem.label}</Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
             <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href={item.href!}
                            onClick={() => isMobile && setOpen(false)}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                                isActive ? "text-primary" : "text-muted-foreground",
                                isMobile ? "text-lg p-2 rounded-md hover:bg-accent" : "rounded-md p-2"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className={cn(isMobile ? "" : "hidden md:inline")}>{item.label}</span>
                        </Link>
                    </TooltipTrigger>
                    {!isMobile && (
                        <TooltipContent side="bottom" className="md:hidden">
                            {item.label}
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-2 text-lg font-medium mt-8">
                         {mainNavLinks.map((link) => (
                            <NavLink key={link.label} item={link} />
                         ))}
                    </nav>
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {mainNavLinks.map((link) => (
                <NavLink key={link.label} item={link} />
            ))}
        </nav>
    )
}

export function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6 sticky top-0 z-30">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold font-headline text-lg mr-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M2 7v10M2 12h10M12 7v10M16 7v10M22 7v10M16 12h6"/></svg>
        <span className="hidden sm:inline">CoopBank</span>
      </Link>
      
      <div className="flex-1">
        <MainNav />
      </div>
      
      <div className="md:hidden">
        <MainNav isMobile />
      </div>

      <div className="flex items-center gap-4">
         <form className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-64"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Globe className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              English
            </DropdownMenuItem>
            <DropdownMenuItem>
              नेपाली
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <UserNav />
      </div>
    </header>
  );
}
