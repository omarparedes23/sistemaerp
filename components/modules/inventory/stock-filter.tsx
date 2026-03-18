"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Warehouse } from "@/types/database";

interface StockFilterProps {
  warehouses: Pick<Warehouse, "id" | "name">[];
  currentWarehouseId?: number;
}

export function StockFilter({ warehouses, currentWarehouseId }: StockFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("warehouse", e.target.value);
    } else {
      params.delete("warehouse");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      onChange={handleChange}
      defaultValue={currentWarehouseId?.toString() ?? ""}
      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <option value="">Todos los almacenes</option>
      {warehouses.map((w) => (
        <option key={w.id} value={w.id.toString()}>
          {w.name}
        </option>
      ))}
    </select>
  );
}
