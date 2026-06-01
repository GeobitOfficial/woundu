"use client";



import Link from "next/link";

import { useRouter } from "next/navigation";

import { useMemo, useState, type FormEvent } from "react";

import { ZodError } from "zod";



import { LATIN_AMERICA_COUNTRIES } from "@/constants/latinAmericaCountries";

import {

  formatCurrencyLabel,

  getCurrencyForCountry,

  isLatinAmericaCountry,

} from "@/constants/countryCurrencies";

import { Button, Input, PasswordInput } from "@/components/ui";

import {

  mapSignUpAuthErrorToUserMessage,

  signUpWithEmail,

} from "@/features/auth";

import { registerSchema, type RegisterFormValues } from "@/validations/auth";



type RegisterErrors = Partial<Record<keyof RegisterFormValues, string>>;

type FormStatus = Readonly<{

  type: "success" | "error";

  message: string;

}>;



export function RegisterForm() {

  const router = useRouter();

  const [errors, setErrors] = useState<RegisterErrors>({});

  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState<FormStatus | null>(null);

  const [selectedCountry, setSelectedCountry] = useState("");



  const selectedCurrencyLabel = useMemo(() => {

    if (!isLatinAmericaCountry(selectedCountry)) {

      return null;

    }



    return formatCurrencyLabel(getCurrencyForCountry(selectedCountry));

  }, [selectedCountry]);



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault();

    const formData = new FormData(event.currentTarget);



    try {

      const values = registerSchema.parse({

        fullName: String(formData.get("fullName") ?? ""),

        email: String(formData.get("email") ?? ""),

        password: String(formData.get("password") ?? ""),

        confirmPassword: String(formData.get("confirmPassword") ?? ""),

        country: String(formData.get("country") ?? ""),

      });

      setErrors({});

      setStatus(null);

      setIsLoading(true);



      if (!isLatinAmericaCountry(values.country)) {

        setErrors({ country: "Selecciona un pais valido de Latinoamerica." });

        return;

      }



      const currency = getCurrencyForCountry(values.country);



      const { data, error } = await signUpWithEmail({

        email: values.email,

        fullName: values.fullName,

        password: values.password,

        country: values.country,

        currency,

      });



      if (error) {

        setStatus({

          type: "error",

          message: mapSignUpAuthErrorToUserMessage(error),

        });

        return;

      }



      if (data.session) {

        router.push("/cuenta");

        router.refresh();

        return;

      }



      setStatus({

        type: "success",

        message:

          "Cuenta creada. Revisa tu email para confirmar el acceso a Woundu.",

      });

    } catch (error) {

      if (error instanceof ZodError) {

        setStatus(null);

        setErrors(getRegisterErrors(error));

        return;

      }



      setStatus({

        type: "error",

        message: "No pudimos crear la cuenta. Intentalo de nuevo.",

      });

    } finally {

      setIsLoading(false);

    }

  }



  return (

    <div>

      <div>

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">

          Crear cuenta

        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">

          Empieza en Woundu

        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">

          Crea tu perfil para publicar productos y comprar con confianza. Tus

          precios y ganancias usaran la moneda de tu pais.

        </p>

      </div>



      <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>

        <Input

          autoComplete="name"

          error={errors.fullName}

          label="Nombre completo"

          name="fullName"

          placeholder="Tu nombre"

          type="text"

        />

        <Input

          autoComplete="email"

          error={errors.email}

          label="Email"

          name="email"

          placeholder="tu@email.com"

          type="email"

        />



        <label className="space-y-2">

          <span className="text-sm font-semibold text-slate-800">Pais</span>

          <select

            aria-invalid={Boolean(errors.country)}

            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"

            name="country"

            onChange={(event) => setSelectedCountry(event.target.value)}

            value={selectedCountry}

          >

            <option value="">Selecciona tu pais</option>

            {LATIN_AMERICA_COUNTRIES.map((country) => (

              <option key={country} value={country}>

                {country}

              </option>

            ))}

          </select>

          {errors.country ? (

            <p className="text-xs leading-5 text-red-600">{errors.country}</p>

          ) : selectedCurrencyLabel ? (

            <p className="text-xs leading-5 text-slate-500">

              Moneda de tu cuenta:{" "}

              <span className="font-semibold text-slate-700">

                {selectedCurrencyLabel}

              </span>

            </p>

          ) : (

            <p className="text-xs leading-5 text-slate-500">

              Define la moneda en la que publicaras y veras tus ganancias.

            </p>

          )}

        </label>



        <PasswordInput

          autoComplete="new-password"

          error={errors.password}

          helperText="Minimo 8 caracteres."

          label="Contrasena"

          name="password"

          placeholder="Crea una contrasena"

        />

        <PasswordInput

          autoComplete="new-password"

          error={errors.confirmPassword}

          label="Confirmar contrasena"

          name="confirmPassword"

          placeholder="Repite tu contrasena"

        />



        {status ? (

          <p

            className={

              status.type === "success"

                ? "rounded-2xl bg-brand-light px-4 py-3 text-sm text-brand-dark"

                : "rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"

            }

          >

            {status.message}

          </p>

        ) : null}



        <Button className="w-full" disabled={isLoading} type="submit">

          {isLoading ? "Creando cuenta..." : "Crear cuenta"}

        </Button>

      </form>



      <p className="mt-6 text-center text-sm text-slate-600">

        Ya tienes cuenta?{" "}

        <Link className="font-bold text-slate-950 hover:text-brand" href="/login">

          Iniciar sesion

        </Link>

      </p>

    </div>

  );

}



function getRegisterErrors(error: unknown): RegisterErrors {

  if (!(error instanceof ZodError)) {

    return {};

  }



  return error.issues.reduce<RegisterErrors>((accumulator, issue) => {

    const field = issue.path[0];



    if (

      field === "fullName" ||

      field === "email" ||

      field === "password" ||

      field === "confirmPassword" ||

      field === "country"

    ) {

      accumulator[field] = issue.message;

    }



    return accumulator;

  }, {});

}


