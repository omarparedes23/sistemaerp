import type { Metadata } from "next";
import { getClients, deleteClient } from "@/actions/clients";
import { ClientDialog } from "@/components/modules/ventas/client-dialog";
import { DeleteButton } from "@/components/modules/catalog/delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Clientes" };

const DOC_TYPE_LABELS: Record<string, string> = {
  RUC: "RUC",
  DNI: "DNI",
  Otros: "Otros",
};

const DOC_TYPE_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  RUC: "default",
  DNI: "secondary",
  Otros: "outline",
};

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">
            Directorio de clientes con RUC, DNI u otro documento
          </p>
        </div>
        <ClientDialog />
      </div>

      <div className="rounded-lg border bg-card">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No hay clientes registrados. Crea el primero.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead className="w-28">Tipo</TableHead>
                <TableHead className="w-36">Nro. Doc.</TableHead>
                <TableHead>Razón Social / Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="text-muted-foreground">
                    {client.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={DOC_TYPE_VARIANT[client.type] ?? "outline"}>
                      {DOC_TYPE_LABELS[client.type] ?? client.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {client.number}
                  </TableCell>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {client.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {client.email ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ClientDialog client={client} />
                      <DeleteButton
                        label="cliente"
                        action={deleteClient.bind(null, client.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {clients.length} cliente{clients.length !== 1 ? "s" : ""} registrado
        {clients.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
