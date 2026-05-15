import type { Metadata } from "next";

import { AuthLayout, RegisterForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Crea una cuenta en Woundu para publicar productos y comprar con confianza.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      description="Crea tu perfil para preparar publicaciones, favoritos, reputacion y futuras compras seguras."
      eyebrow="Nuevo en Woundu"
      title="Crea tu cuenta y empieza a vender."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
