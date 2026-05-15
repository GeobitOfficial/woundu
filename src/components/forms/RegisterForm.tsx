"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ZodError } from "zod";

import { AuthDivider } from "@/components/forms/AuthDivider";
import { GoogleSignInButton } from "@/components/forms/GoogleSignInButton";
import { Button, Input } from "@/components/ui";
import {
  getGoogleSignInFallbackMessage,
  mapSignUpAuthErrorToUserMessage,
  signInWithGoogle,
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const values = registerSchema.parse({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      });
      setErrors({});
      setStatus(null);
      setIsLoading(true);

      const { data, error } = await signUpWithEmail({
        email: values.email,
        fullName: values.fullName,
        password: values.password,
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

  async function handleGoogleSignIn() {
    setStatus(null);
    setIsLoading(true);

    const { error } = await signInWithGoogle();

    if (error) {
      setIsLoading(false);
      setStatus({
        type: "error",
        message: getGoogleSignInFallbackMessage(error.message),
      });
    }
  }

  return (
    <div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
          Crear cuenta
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Empieza en Woundu
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Crea tu perfil para publicar productos y comprar con confianza.
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
        <Input
          autoComplete="new-password"
          error={errors.password}
          helperText="Minimo 8 caracteres."
          label="Contrasena"
          name="password"
          placeholder="Crea una contrasena"
          type="password"
        />
        <Input
          autoComplete="new-password"
          error={errors.confirmPassword}
          label="Confirmar contrasena"
          name="confirmPassword"
          placeholder="Repite tu contrasena"
          type="password"
        />

        {status ? (
          <p
            className={
              status.type === "success"
                ? "rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
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

      <div className="my-6">
        <AuthDivider />
      </div>

      <GoogleSignInButton disabled={isLoading} onClick={handleGoogleSignIn} />

      <p className="mt-6 text-center text-sm text-slate-600">
        Ya tienes cuenta?{" "}
        <Link className="font-bold text-slate-950 hover:text-emerald-700" href="/login">
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
      field === "confirmPassword"
    ) {
      accumulator[field] = issue.message;
    }

    return accumulator;
  }, {});
}
