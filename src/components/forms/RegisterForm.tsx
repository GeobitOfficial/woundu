"use client";



import Link from "next/link";

import { useRouter } from "next/navigation";

import { useMemo, useState, type FormEvent } from "react";

import { ZodError } from "zod";




import {

  formatCurrencyLabel,

  getCurrencyForCountry,

  isLatinAmericaCountry,

} from "@/constants/countryCurrencies";

import { Button, Input, PasswordInput } from "@/components/ui";
import { CountrySearchSelect } from "@/components/forms/CountrySearchSelect";

import { registerUserAction } from "@/features/auth/actions/registerUserAction";
import { signInWithEmail } from "@/features/auth";
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



      const { error: registerError } = await registerUserAction(values);

      if (registerError) {
        setStatus({
          type: "error",
          message: registerError,
        });
        return;
      }

      const { data, error: signInError } = await signInWithEmail({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        setStatus({
          type: "success",
          message:
            "Cuenta creada. Inicia sesión con tu email y contraseña.",
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
        message: "Cuenta creada correctamente.",
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
          Registro solo con email y contraseña. La cuenta creada desde aquí será
          de comprador y el acceso como vendedor se asignará desde administración.
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

        <div className="rounded-2xl border border-brand/20 bg-brand-light/30 p-4 text-sm leading-6 text-slate-700">
          Tu cuenta se registrará como comprador desde esta pantalla. Si en el
          futuro necesitas vender, un administrador podrá asignarte ese acceso.
        </div>

        <CountrySearchSelect
          error={errors.country}
          onCountryChange={setSelectedCountry}
          selectedCountry={selectedCountry}
        />

        {selectedCurrencyLabel ? (
          <p className="-mt-3 text-xs leading-5 text-slate-500">
            Moneda de tu cuenta:{" "}
            <span className="font-semibold text-slate-700">
              {selectedCurrencyLabel}
            </span>
          </p>
        ) : (
          <p className="-mt-3 text-xs leading-5 text-slate-500">
            Define la moneda en la que publicaras y veras tus ganancias.
          </p>
        )}



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

      field === "country" ||

      field === "role"

    ) {

      accumulator[field] = issue.message;

    }



    return accumulator;

  }, {});

}


