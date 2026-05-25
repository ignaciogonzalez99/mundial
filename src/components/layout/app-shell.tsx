"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Gauge,
  Menu,
  Settings2,
  Shield,
  Table2,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/teams", label: "Selecciones", icon: Shield },
  { href: "/groups", label: "Grupos", icon: Table2 },
  { href: "/matches", label: "Partidos", icon: CalendarDays },
  { href: "/predictions", label: "Predicciones", icon: BarChart3 },
  { href: "/admin", label: "Admin", icon: Settings2 },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              active && "bg-secondary text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-sidebar px-4 py-5 lg:block">
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <div className="rounded-md bg-primary p-2 text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Mundial 2026</p>
              <p className="text-xs text-muted-foreground">Analitica deportiva</p>
            </div>
          </Link>
          <div className="mt-8">
            <NavLinks />
          </div>
          <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-primary" />
              JSON local
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Persistencia reemplazable por DB desde la capa de repositorio.
            </p>
          </div>
        </aside>

        <div className="lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:px-8">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="outline" size="icon" aria-label="Abrir navegacion" />
                  }
                >
                    <Menu className="h-4 w-4" />
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Mundial 2026</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden text-sm text-muted-foreground lg:block">
              Sistema analitico, no apuestas
            </div>
            <Link href="/matches" className={buttonVariants({ variant: "secondary" })}>
              Ver fixture
            </Link>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
