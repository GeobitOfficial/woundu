"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ZodError } from "zod";

import { Button, Input } from "@/components/ui";
import { updateCountryCurrencyAsAdmin } from "@/features/admin/services/adminMutations";
import type { AdminCountryCurrencyRecord } from "@/features/admin/types";
import {
  adminCountryCurrencySchema,
  type AdminCountryCurrencyValues,
} from "@/validations/admin";

type CountryCurrencyManagementProps = Readonly<{
  initialCountries: AdminCountryCurrencyRecord[];
}>;

export function CountryCurrencyManagement({
  initialCountries,
}: CountryCurrencyManagementProps) {
  const router = useRouter();
  const [countries, setCountries] = useState(initialCountries);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [currency, setCurrency] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return countries;
    }

    return countries.filter(
      (item) =>
        item.country.toLowerCase().includes(query) ||
        item.currency.toLowerCase().includes(query),
    );
  }, [countries, search]);

  const selectedRecord =
    countries.find((item) => item.country === selectedCountry) ?? null;

  function startEdit(record: AdminCountryCurrencyRecord) {
    setSelectedCountry(record.country);
    setCurrency(record.currency);
    setStatus(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecord) {
      return;
    }

    setIsSaving(true);
    setStatus(null);

    try {
      const parsed: AdminCountryCurrencyValues = adminCountryCurrencySchema.parse({
        country: selectedRecord.country,
        currency,
      });

      const result = await updateCountryCurrencyAsAdmin(parsed);

      if (result.error || !result.data) {
        setStatus(result.error ?? "No pudimos actualizar la moneda.");
        return;
      }

      setCountries((current) =>
        current.map((item) =>
          item.country === result.data?.country ? result.data : item,
        ),
      );
      setStatus(`Moneda de ${result.data.country} actualizada a ${result.data.currency}.`);
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setStatus(error.issues[0]?.message ?? "Datos inválidos.");
        return;
      }

      setStatus("No pudimos actualizar la moneda.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Input
        label="Buscar país o moneda"
        name="search"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Ej. México, USD"
        value={search}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">
              Países configurados ({filteredCountries.length})
            </h2>
          </div>

          {filteredCountries.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-600">
              No hay países que coincidan con la búsqueda.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredCountries.map((record) => (
                <li
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  key={record.country}
                >
                  <div>
                    <p className="font-semibold text-slate-950">{record.country}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Moneda: <span className="font-mono">{record.currency}</span>
                    </p>
                  </div>
                  <Button
                    onClick={() => startEdit(record)}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    Editar moneda
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {!selectedRecord ? (
            <p className="text-sm text-slate-600">
              Selecciona un país para cambiar su moneda ISO (3 letras).
            </p>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-950">{selectedRecord.country}</h2>
              <p className="mt-1 text-sm text-slate-600">
                Moneda actual:{" "}
                <span className="font-mono font-semibold">{selectedRecord.currency}</span>
              </p>

              <form className="mt-5 space-y-4" noValidate onSubmit={handleSubmit}>
                <Input
                  helperText="Código ISO de 3 letras, por ejemplo MXN, USD, COP."
                  label="Nueva moneda"
                  maxLength={3}
                  name="currency"
                  onChange={(event) =>
                    setCurrency(event.target.value.toUpperCase())
                  }
                  value={currency}
                />

                {status ? (
                  <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">
                    {status}
                  </p>
                ) : null}

                <Button className="w-full" disabled={isSaving} type="submit">
                  {isSaving ? "Guardando..." : "Guardar moneda"}
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
