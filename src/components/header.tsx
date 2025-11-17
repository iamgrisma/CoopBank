
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

const mainNavLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/members", label: "Members", icon: UsersRound },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/shares", label: "Shares", icon: Wallet },
  { href: "/savings", label: "Savings", icon: Wallet },
  { href: "/loans", label: "Loans", icon: HandCoins },
  { href: "/accounting/journals", label: "Journals", icon: BookOpenCheck },
  { href: "/reports", label: "Reports", icon: FilePieChart },
];


const MainNav = () => {
    const pathname = usePathname();
    return (
        <nav className="flex items-center space-x-4 lg:space-x-6">
            {mainNavLinks.map(({ href, label, icon: Icon }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                        pathname === href ? "text-primary" : "text-muted-foreground"
                    )}
                >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </Link>
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
        <span>CoopBank</span>
      </Link>
      
      <div className="flex-1">
        <MainNav />
      </div>

      <div className="flex items-center gap-4">
         <form>
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
