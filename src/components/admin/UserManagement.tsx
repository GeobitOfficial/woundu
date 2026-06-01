"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { setUserBanAsAdmin } from "@/features/admin/services/adminMutations";
import type { AdminUserRecord } from "@/features/admin/types";
import { formatAdminDate, getUserRoleLabel } from "@/lib/admin/labels";
import { Button, Input } from "@/components/ui";

type UserManagementProps = Readonly<{
  initialUsers: AdminUserRecord[];
}>;

export function UserManagement({ initialUsers }: UserManagementProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.fullName, user.email, user.username, user.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [search, users]);

  const selectedUser = users.find((user) => user.id === selectedId) ?? null;

  async function handleBanToggle(shouldBan: boolean) {
    if (!selectedUser) {
      return;
    }

    setIsSaving(true);
    setStatus(null);

    const result = await setUserBanAsAdmin(selectedUser.id, {
      isBanned: shouldBan,
      banReason: shouldBan ? banReason : "",
    });

    setIsSaving(false);

    if (result.error || !result.data) {
      setStatus(result.error ?? "No pudimos actualizar el usuario.");
      return;
    }

    setUsers((current) =>
      current.map((user) => (user.id === result.data?.id ? result.data : user)),
    );
    setStatus(
      shouldBan
        ? `"${result.data.fullName}" quedó baneado.`
        : `"${result.data.fullName}" puede volver a usar la plataforma.`,
    );
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Input
        label="Buscar usuario"
        name="search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Nombre, email, username o ID"
        value={search}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">
              Usuarios ({filteredUsers.length})
            </h2>
          </div>

          <ul className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <li
                className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                key={user.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{user.fullName}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-600">
                      {getUserRoleLabel(user.role)}
                    </span>
                    {user.isBanned ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold uppercase text-red-700">
                        Baneado
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {user.email ?? "Sin email"} · Registro{" "}
                    {formatAdminDate(user.createdAt)}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedId(user.id);
                    setBanReason(user.banReason ?? "");
                    setStatus(null);
                  }}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  Gestionar
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {!selectedUser ? (
            <p className="text-sm text-slate-600">
              Selecciona un usuario para banearlo o reactivar su cuenta.
            </p>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-950">{selectedUser.fullName}</h2>
              <dl className="mt-4 space-y-2 text-sm text-slate-700">
                <div>
                  <dt className="font-semibold text-slate-900">Email</dt>
                  <dd>{selectedUser.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Username</dt>
                  <dd>{selectedUser.username ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Reputación</dt>
                  <dd>
                    {selectedUser.reputationScore.toFixed(1)} ·{" "}
                    {selectedUser.reviewsCount} reseñas
                  </dd>
                </div>
                {selectedUser.isBanned ? (
                  <div>
                    <dt className="font-semibold text-slate-900">Motivo del ban</dt>
                    <dd>{selectedUser.banReason ?? "—"}</dd>
                  </div>
                ) : null}
              </dl>

              {!selectedUser.isBanned ? (
                <label className="mt-5 flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-slate-800">
                    Motivo del ban (opcional)
                  </span>
                  <textarea
                    className="min-h-20 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    onChange={(event) => setBanReason(event.target.value)}
                    value={banReason}
                  />
                </label>
              ) : null}

              {status ? (
                <p className="mt-4 rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
                  {status}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {selectedUser.isBanned ? (
                  <Button
                    disabled={isSaving}
                    onClick={() => handleBanToggle(false)}
                    type="button"
                  >
                    Reactivar usuario
                  </Button>
                ) : (
                  <Button
                    disabled={isSaving}
                    onClick={() => handleBanToggle(true)}
                    type="button"
                    variant="secondary"
                  >
                    Banear usuario
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
