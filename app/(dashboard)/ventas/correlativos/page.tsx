import type { Metadata } from "next";
import { getSequences } from "@/actions/sequences";
import { SequenceDialog } from "@/components/modules/ventas/sequence-dialog";
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
import type { ActionState } from "@/actions/brands";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = { title: "Correlativos" };

async function deleteSequence(id: number): Promise<ActionState> {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase
    .from("document_sequences")
    .delete()
    .eq("id", id);
  if (error) {
    return { error: { name: [error.message] } };
  }
  revalidatePath("/ventas/correlativos");
  return { message: "Serie eliminada" };
}

export default async function CorrelativosPage() {
  const sequences = await getSequences();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Correlativos</h2>
          <p className="text-muted-foreground">
            Controla la numeración automática o manual de Facturas y Boletas
          </p>
        </div>
        <SequenceDialog />
      </div>

      <div className="rounded-lg border bg-card">
        {sequences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No hay series configuradas. Crea la primera.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Tipo</TableHead>
                <TableHead className="w-24">Serie</TableHead>
                <TableHead className="w-36">Número Actual</TableHead>
                <TableHead className="w-36">Próximo Nro.</TableHead>
                <TableHead className="w-36">Modo</TableHead>
                <TableHead className="w-24">Estado</TableHead>
                <TableHead className="w-24 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sequences.map((seq) => (
                <TableRow key={seq.id}>
                  <TableCell>
                    <Badge variant={seq.doc_type === "Factura" ? "default" : "secondary"}>
                      {seq.doc_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {seq.series}
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">
                    {String(seq.current_number).padStart(5, "0")}
                  </TableCell>
                  <TableCell className="font-mono font-medium text-green-600">
                    {String(seq.current_number + 1).padStart(5, "0")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={seq.is_automatic ? "default" : "outline"}>
                      {seq.is_automatic ? "Automático" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={seq.is_active ? "default" : "outline"}>
                      {seq.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <SequenceDialog sequence={seq} />
                      <DeleteButton
                        label="serie"
                        action={deleteSequence.bind(null, seq.id)}
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
        {sequences.length} serie{sequences.length !== 1 ? "s" : ""} configurada
        {sequences.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
