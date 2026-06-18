"use client";



import { useRouter } from "next/navigation";

import { useState, type FormEvent } from "react";

import { ChevronDown, Plus, Trash2 } from "lucide-react";

import { ZodError } from "zod";



import { SellerPayoutMethodsDisplay } from "@/components/account/SellerPayoutMethodsDisplay";

import { Button, Input } from "@/components/ui";

import {

  PAYOUT_ACCOUNT_TYPES,

  type PayoutAccountType,

} from "@/constants/payoutAccountTypes";

import type { SellerPayoutProfile } from "@/features/orders/types";

import { saveSellerPayoutSettings } from "@/features/account/services/payoutMutations";

import {

  sellerPayoutSettingsSchema,

  type SellerPayoutMethodFormValues,

  type SellerPayoutSettingsFormValues,

} from "@/validations/payout";

import { cn } from "@/lib/utils";



type SellerPayoutFormProps = Readonly<{

  initialPayout: SellerPayoutProfile | null;

}>;



function createEmptyMethod(isPrimary = false): SellerPayoutMethodFormValues {

  return {

    accountType: "savings",

    entityName: "",

    accountNumber: "",

    accountHolder: "",

    instructions: "",

    isPrimary,

  };

}



function mapInitialMethods(

  payout: SellerPayoutProfile | null,

): SellerPayoutMethodFormValues[] {

  if (!payout || payout.methods.length === 0) {

    return [createEmptyMethod(true)];

  }



  return payout.methods.map((method) => ({

    id: method.id,

    accountType: method.accountType,

    entityName: method.entityName,

    accountNumber: method.accountNumber,

    accountHolder: method.accountHolder,

    instructions: method.instructions ?? "",

    isPrimary: method.isPrimary,

  }));

}



export function SellerPayoutForm({ initialPayout }: SellerPayoutFormProps) {

  const router = useRouter();

  const [methods, setMethods] = useState<SellerPayoutMethodFormValues[]>(() =>

    mapInitialMethods(initialPayout),

  );

  const [status, setStatus] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);



  function updateMethod(

    index: number,

    patch: Partial<SellerPayoutMethodFormValues>,

  ) {

    setMethods((current) =>

      current.map((method, methodIndex) =>

        methodIndex === index ? { ...method, ...patch } : method,

      ),

    );

  }



  function setPrimaryMethod(index: number) {

    setMethods((current) =>

      current.map((method, methodIndex) => ({

        ...method,

        isPrimary: methodIndex === index,

      })),

    );

  }



  function addMethod() {

    setMethods((current) => [...current, createEmptyMethod(current.length === 0)]);

  }



  function removeMethod(index: number) {

    setMethods((current) => {

      const next = current.filter((_, methodIndex) => methodIndex !== index);

      if (next.length === 0) {

        return [createEmptyMethod(true)];

      }



      if (!next.some((method) => method.isPrimary)) {

        next[0] = { ...next[0], isPrimary: true };

      }



      return next;

    });

  }



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    setIsSaving(true);

    setStatus(null);



    try {

      const parsed: SellerPayoutSettingsFormValues =

        sellerPayoutSettingsSchema.parse({ methods });

      const result = await saveSellerPayoutSettings(parsed);



      if (result.error) {

        setStatus(result.error);

        return;

      }



      if (result.data) {

        setMethods(mapInitialMethods(result.data));

      }



      setStatus("Métodos de cobro guardados. Los compradores los verán al pedir.");

      router.refresh();

    } catch (error) {

      if (error instanceof ZodError) {

        setStatus(error.issues[0]?.message ?? "Revisa los datos.");

        return;

      }



      setStatus("No pudimos guardar tus métodos de cobro.");

    } finally {

      setIsSaving(false);

    }

  }



  return (

    <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm">

      <details className="group">

        <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">

          <div>

            <h2 className="text-lg font-black text-slate-950">Métodos de cobro</h2>

            <p className="mt-1 text-sm text-slate-600">

              Agrega cuentas bancarias o billeteras digitales. Puedes registrar varios

              métodos, marcar uno como principal e indicar instrucciones específicas para

              cada uno.

            </p>

          </div>

          <ChevronDown

            aria-hidden

            className="mt-1 h-5 w-5 shrink-0 text-slate-500 transition group-open:rotate-180"

          />

        </summary>



        <div className="border-t border-slate-100 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>

        {methods.map((method, index) => (

          <article

            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"

            key={`payout-method-${index}`}

          >

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

              <p className="text-sm font-bold text-slate-900">

                Método {index + 1}

              </p>

              <div className="flex items-center gap-2">

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">

                  <input

                    checked={Boolean(method.isPrimary)}

                    name="primaryMethod"

                    onChange={() => setPrimaryMethod(index)}

                    type="radio"

                  />

                  Principal

                </label>

                {methods.length > 1 ? (

                  <button

                    aria-label={`Eliminar método ${index + 1}`}

                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50"

                    onClick={() => removeMethod(index)}

                    type="button"

                  >

                    <Trash2 aria-hidden className="h-4 w-4" />

                  </button>

                ) : null}

              </div>

            </div>



            <div className="grid gap-4 sm:grid-cols-2">

              <label className="grid gap-1.5 sm:col-span-2">

                <span className="text-sm font-semibold text-slate-800">

                  Tipo de cuenta

                </span>

                <select

                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"

                  onChange={(event) =>

                    updateMethod(index, {

                      accountType: event.target.value as PayoutAccountType,

                    })

                  }

                  value={method.accountType}

                >

                  {PAYOUT_ACCOUNT_TYPES.map((option) => (

                    <option key={option.value} value={option.value}>

                      {option.label}

                    </option>

                  ))}

                </select>

              </label>



              <Input

                label={

                  method.accountType === "digital_wallet"

                    ? "Billetera o plataforma"

                    : "Entidad bancaria"

                }

                name={`entityName-${index}`}

                onChange={(event) =>

                  updateMethod(index, { entityName: event.target.value })

                }

                placeholder={

                  method.accountType === "digital_wallet"

                    ? "Ej. Nequi, Daviplata, PayPal"

                    : "Ej. Bancolombia, BBVA"

                }

                value={method.entityName}

              />



              <Input

                label="Titular de la cuenta"

                name={`accountHolder-${index}`}

                onChange={(event) =>

                  updateMethod(index, { accountHolder: event.target.value })

                }

                value={method.accountHolder}

              />



              <Input

                className="sm:col-span-2"

                label="Número de cuenta o alias"

                name={`accountNumber-${index}`}

                onChange={(event) =>

                  updateMethod(index, { accountNumber: event.target.value })

                }

                value={method.accountNumber}

              />



              <label className="flex flex-col gap-1.5 sm:col-span-2">

                <span className="text-sm font-medium text-slate-800">

                  Instrucciones adicionales (opcional)

                </span>

                <textarea

                  className="min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"

                  name={`instructions-${index}`}

                  onChange={(event) =>

                    updateMethod(index, { instructions: event.target.value })

                  }

                  placeholder="Horarios, comprobante requerido, referencia de pago, etc."

                  value={method.instructions ?? ""}

                />

              </label>

            </div>

          </article>

        ))}



        <Button

          className={cn("w-full sm:w-auto")}

          onClick={addMethod}

          type="button"

          variant="secondary"

        >

          <Plus aria-hidden className="h-4 w-4" />

          Agregar método

        </Button>



        {status ? (

          <p className="rounded-xl bg-brand-light px-4 py-3 text-sm text-brand-dark">

            {status}

          </p>

        ) : null}



        <Button className="w-full sm:w-auto" disabled={isSaving} type="submit">

          {isSaving ? "Guardando..." : "Guardar métodos de cobro"}

        </Button>

      </form>



      {initialPayout && initialPayout.methods.length > 0 ? (

        <div className="mt-8 border-t border-slate-100 pt-6">

          <p className="text-sm font-bold text-slate-900">Vista previa para compradores</p>

          <div className="mt-3">

            <SellerPayoutMethodsDisplay compact payout={initialPayout} />

          </div>

        </div>

      ) : null}

        </div>

      </details>

    </section>

  );

}


