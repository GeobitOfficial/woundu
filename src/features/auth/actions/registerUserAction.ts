"use server";

import { registerUserOnServer } from "@/features/auth/services/registerUserServer";
import type { RegisterFormValues } from "@/validations/auth";

export async function registerUserAction(
  values: RegisterFormValues,
): Promise<{ error: string | null }> {
  try {
    return await registerUserOnServer(values);
  } catch {
    return { error: "No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo." };
  }
}
