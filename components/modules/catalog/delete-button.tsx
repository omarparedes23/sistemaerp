"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/actions/brands";

interface DeleteButtonProps {
  action: () => Promise<ActionState>;
  label: string; // ej: "marca", "categoría"
}

export function DeleteButton({ action, label }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`¿Estás seguro de eliminar esta ${label}? Esta acción no se puede deshacer.`)) {
      return;
    }
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        const msg = Object.values(result.error).flat().join(". ");
        alert(msg);
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Eliminar {label}</span>
    </Button>
  );
}
