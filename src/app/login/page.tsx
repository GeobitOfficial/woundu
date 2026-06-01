import type { Metadata } from "next";

import { AuthLayout, LoginForm } from "@/components/forms";

export const metadata: Metadata = {
  title: "Iniciar sesion",
  description:
    "Inicia sesion en Woundu para gestionar publicaciones, favoritos y compras.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      description="Accede a una experiencia preparada para comprar, vender y gestionar tu actividad dentro del marketplace."
      eyebrow="Acceso seguro"
      title="Vuelve a tu marketplace."
    >
      <LoginForm />
    </AuthLayout>
  );
}
