import type { Metadata } from "next";

import { TicketManagement } from "@/components/admin";
import { getAllSupportTicketsForAdmin } from "@/features/admin";

export const metadata: Metadata = {
  title: "Soporte",
};

export default async function AdminSupportPage() {
  const tickets = await getAllSupportTicketsForAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Tickets de soporte
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Recibe consultas de los usuarios, responde desde el panel y actualiza el
          estado de cada ticket.
        </p>
      </div>

      <TicketManagement initialTickets={tickets} />
    </div>
  );
}
