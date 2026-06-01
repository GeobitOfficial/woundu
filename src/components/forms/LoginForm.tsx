"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ZodError } from "zod";

import { Button, Input, PasswordInput } from "@/components/ui";
import { signInWithEmail } from "@/features/auth";
import { getPostLoginRedirectPath } from "@/lib/auth/roles";
import { signOut, supabase } from "@/services/supabase/client";
import type { UserRole } from "@/types";
import { loginSchema, type LoginFormValues } from "@/validations/auth";

type LoginErrors = Partial<Record<keyof LoginFormValues, string>>;
type FormStatus = Readonly<{
  type: "success" | "error";
  message: string;
}>;

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);

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

      const { data: authData, error } = await signInWithEmail(values);

      if (error) {
        setStatus({
          type: "error",
          message: getAuthErrorMessage(error.message),
        });
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setStatus({
          type: "error",
          message: "No pudimos iniciar sesion. Intentalo de nuevo.",
        });
        return;
      }

      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("is_banned, ban_reason, role")
        .eq("id", userId)
        .maybeSingle();

      const profile = profileRow as
        | {
            is_banned?: boolean;
            ban_reason?: string | null;
            role?: UserRole | null;
          }
        | null;

      if (!profileError && profile?.is_banned) {
        await signOut();
        setStatus({
          type: "error",
          message:
            profile.ban_reason ??
            "Tu cuenta fue suspendida. Contacta soporte si crees que es un error.",
        });
        return;
      }

      router.push(getPostLoginRedirectPath(profile?.role));
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

  return (
    <div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand">
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
        <PasswordInput
          autoComplete="current-password"
          error={errors.password}
          label="Contrasena"
          name="password"
          placeholder="Tu contrasena"
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
          {isLoading ? "Ingresando..." : "Continuar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Aun no tienes cuenta?{" "}
        <Link className="font-bold text-slate-950 hover:text-brand" href="/registro">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}

function getAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "El email o la contrasena no son correctos.";
  }

  if (normalizedMessage.includes("email not confirmed")) {
    return "Confirma tu email antes de iniciar sesion.";
  }

  if (
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("fetch failed")
  ) {
    return "No pudimos conectar con Supabase. Revisa tu conexion e intentalo de nuevo.";
  }

  if (
    normalizedMessage.includes("invalid api key") ||
    normalizedMessage.includes("api key")
  ) {
    return "La clave anon de Supabase no es valida. En el dashboard ve a Settings > API, copia de nuevo Project URL y anon public key en .env.local, y reinicia el servidor (npm run dev).";
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
