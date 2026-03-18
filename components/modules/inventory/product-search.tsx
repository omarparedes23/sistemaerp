"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProductSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement).value.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder="Buscar por SKU o nombre..."
          className="pl-9 w-64"
        />
        {defaultValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" variant="secondary" disabled={isPending}>
        Buscar
      </Button>
    </form>
  );
}
