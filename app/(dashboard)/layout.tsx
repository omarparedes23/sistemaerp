import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        {/* Breadcrumbs */}
        <div className="border-b bg-muted/30 px-6 py-2">
          <Breadcrumbs />
        </div>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
