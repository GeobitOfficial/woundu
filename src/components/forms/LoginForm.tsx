"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ZodError } from "zod";

import { AuthDivider } from "@/components/forms/AuthDivider";
import { GoogleSignInButton } from "@/components/forms/GoogleSignInButton";
import { Button, Input } from "@/components/ui";
import {
  getGoogleSignInFallbackMessage,
  signInWithEmail,
  signInWithGoogle,
} from "@/features/auth";
import { loginSchema, type LoginFormValues } from "@/validations/auth";

type LoginErrors = Partial<Record<keyof LoginFormValues, string>>;
type FormStatus = Readonly<{
  type: "success" | "error";
  message: string;
}>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError !== "oauth") {
      return;
    }
    const code = searchParams.get("error_code");
    const description = searchParams.get("error_description");
    setStatus({
      type: "error",
      message: buildOauthErrorMessage(code, description),
    });
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const values = loginSchema.parse({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      setErrors({});
      setStatus(null);
      setIsLoading(true);

      const { error } = await signInWithEmail(values);

      if (error) {
        setStatus({
          type: "error",
          message: getAuthErrorMessage(error.message),
        });
        return;
      }

      router.push("/cuenta");
      router.refresh();
    } catch (error) {
      if (error instanceof ZodError) {
        setStatus(null);
        setErrors(getLoginErrors(error));
        return;
      }

      setStatus({
        type: "error",
        message: "No pudimos iniciar sesion. Intentalo de nuevo.",
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
          Iniciar sesion
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Entra a tu cuenta
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Accede para gestionar publicaciones, favoritos y futuras compras.
        </p>
      </div>

      <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          error={errors.email}
          label="Email"
          name="email"
          placeholder="tu@email.com"
          type="email"
        />
        <Input
          autoComplete="current-password"
          error={errors.password}
          label="Contrasena"
          name="password"
          placeholder="Tu contrasena"
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
          {isLoading ? "Ingresando..." : "Continuar"}
        </Button>
      </form>

      <div className="my-6">
        <AuthDivider />
      </div>

      <GoogleSignInButton disabled={isLoading} onClick={handleGoogleSignIn} />

      <p className="mt-6 text-center text-sm text-slate-600">
        Aun no tienes cuenta?{" "}
        <Link className="font-bold text-slate-950 hover:text-emerald-700" href="/registro">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}

function buildOauthErrorMessage(
  code: string | null,
  description: string | null,
): string {
  const prefix = "No pudimos completar el inicio con Google.";

  if (code === "missing_code") {
    return `${prefix} El proveedor no devolvió un código. Reintenta o revisa la configuración de Google.`;
  }

  if (code === "exchange_failed") {
    const detail = description?.toLowerCase() ?? "";
    if (detail.includes("code verifier") || detail.includes("pkce")) {
      return `${prefix} Se perdió el estado de la sesión durante el flujo PKCE (cookies de Supabase). Asegúrate de usar el mismo dominio durante todo el flujo (no mezcles "localhost" con "127.0.0.1") y vuelve a intentarlo.`;
    }
    return `${prefix} Detalle del servidor: ${description ?? "intercambio de código fallido"}.`;
  }

  if (description) {
    return `${prefix} ${description}`;
  }

  return `${prefix} Verifica en Supabase: Authentication → URL configuration que "${typeof window !== "undefined" ? window.location.origin : "tu sitio"}/auth/callback" esté en Redirect URLs y que el proveedor Google esté activo.`;
}

function getAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("invalid login credentials")) {
    return "El email o la contrasena no son correctos.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Confirma tu email antes de iniciar sesion.";
  }

  return "No pudimos iniciar sesion. Revisa tus datos e intentalo de nuevo.";
}

function getLoginErrors(error: unknown): LoginErrors {
  if (!(error instanceof ZodError)) {
    return {};
  }

  return error.issues.reduce<LoginErrors>((accumulator, issue) => {
    const field = issue.path[0];

    if (field === "email" || field === "password") {
      accumulator[field] = issue.message;
    }

    return accumulator;
  }, {});
}
