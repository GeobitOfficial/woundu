"use client";

import { useState } from "react";

import { DeletedProductManagement } from "@/components/admin/DeletedProductManagement";
import { ProductManagement } from "@/components/admin/ProductManagement";
import type { AdminDeletedProductRecord, AdminProductRecord } from "@/features/admin/types";

type ProductAdminPanelProps = Readonly<{
  initialProducts: AdminProductRecord[];
  initialDeletedProducts: AdminDeletedProductRecord[];
}>;

export function ProductAdminPanel({
  initialProducts,
  initialDeletedProducts,
}: ProductAdminPanelProps) {
  const [tab, setTab] = useState<"active" | "deleted">("active");

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap gap-2">
        <TabChip
          active={tab === "active"}
          count={initialProducts.length}
          label="Activos"
          onClick={() => setTab("active")}
        />
        <TabChip
          active={tab === "deleted"}
          count={initialDeletedProducts.length}
          label="Eliminados"
          onClick={() => setTab("deleted")}
        />
      </section>

      {tab === "active" ? (
        <ProductManagement initialProducts={initialProducts} />
      ) : (
        <DeletedProductManagement initialProducts={initialDeletedProducts} />
      )}
    </div>
  );
}

function TabChip({
  active,
  count,
  label,
  onClick,
}: Readonly<{
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-brand text-slate-950"
          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      }`}
      onClick={onClick}
      type="button"
    >
      {label} ({count})
    </button>
  );
}
