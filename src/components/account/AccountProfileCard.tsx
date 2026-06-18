"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { PencilLine } from "lucide-react";
import { ZodError } from "zod";

import { ProfileAvatarEditor } from "@/components/account/ProfileAvatarEditor";
import { ProfileCountrySelect } from "@/components/account/ProfileCountrySelect";
import { Button, Input } from "@/components/ui";
import { formatCurrencyLabel } from "@/constants/countryCurrencies";
import type { AccountProfileView } from "@/features/account/types";
import { updateProfile } from "@/features/account/services/profileMutations";
import { canAccessSellerFeatures } from "@/lib/auth/roles";
import { buildUpdateProfileSchema } from "@/validations/profile";

type ProfileFormErrors = Partial<
  Record<
    | "fullName"
    | "username"
    | "bio"
    | "country"
    | "shippingCity"
    | "shippingAddress"
    | "phone"
    | "whatsapp",
    string
  >
>;

type AccountProfileCardProps = Readonly<{
  layout?: "default" | "wide";
  profile: AccountProfileView;
}>;

export function AccountProfileCard({
  layout = "default",
  profile,
}: AccountProfileCardProps) {
  const router = useRouter();
  const isBuyer = profile.role === "buyer";
  const isSeller = canAccessSellerFeatures(profile.role);
  const profileSchema = useMemo(
    () => buildUpdateProfileSchema(profile.role),
    [profile.role],
  );

  const [fullName, setFullName] = useState(profile.fullName);
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [shippingCity, setShippingCity] = useState(profile.shippingCity ?? "");
  const [shippingAddress, setShippingAddress] = useState(
    profile.shippingAddress ?? "",
  );
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? "");
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currencyPreview = useMemo(
    () => formatCurrencyLabel(profile.currency),
    [profile.currency],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setErrors({});

    try {
      const payload = {
        fullName,
        username,
        bio,
        country,
        ...(isBuyer
          ? { shippingCity, shippingAddress, phone }
          : {}),
        ...(isSeller ? { whatsapp } : {}),
      };

      const values = profileSchema.parse(payload);
      setIsLoading(true);
      const { error } = await updateProfile(values);
      setIsLoading(false);

      if (error) {
        setStatus(error);
        return;
      }

      setStatus("Perfil actualizado correctamente.");
      router.refresh();
    } catch (error) {
      setIsLoading(false);

      if (error instanceof ZodError) {
        const nextErrors: ProfileFormErrors = {};

        for (const issue of error.issues) {
          const field = issue.path[0];
          if (typeof field === "string") {
            nextErrors[field as keyof ProfileFormErrors] = issue.message;
          }
        }

        setErrors(nextErrors);
        return;
      }

      setStatus("No pudimos guardar. Intentalo de nuevo.");
    }
  }

  const buyerShippingFields = isBuyer ? (
    <div className="space-y-4 rounded-2xl border border-brand/15 bg-brand-light/20 p-4">
      <div>
        <h3 className="text-sm font-black text-slate-950">Datos de envio</h3>
        <p className="mt-1 text-xs text-slate-600">
          Obligatorios para comprar. El vendedor sabra a donde enviar tu pedido.
        </p>
      </div>
      <Input
        error={errors.shippingCity}
        label="Ciudad de envio"
        name="shippingCity"
        onChange={(event) => setShippingCity(event.target.value)}
        type="text"
        value={shippingCity}
      />
      <label className="grid gap-1.5">
        <span className="text-sm font-semibold text-slate-800">
          Direccion de envio
        </span>
        <textarea
          className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
          name="shippingAddress"
          onChange={(event) => setShippingAddress(event.target.value)}
          placeholder="Calle, numero, barrio, referencias"
          value={shippingAddress}
        />
        {errors.shippingAddress ? (
          <p className="text-xs text-red-600">{errors.shippingAddress}</p>
        ) : null}
      </label>
      <Input
        error={errors.phone}
        helperText="Incluye codigo de area si aplica."
        label="Telefono de contacto"
        name="phone"
        onChange={(event) => setPhone(event.target.value)}
        type="tel"
        value={phone}
      />
    </div>
  ) : null;

  const sellerWhatsappField = isSeller ? (
    <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
      <div>
        <h3 className="text-sm font-black text-slate-950">WhatsApp de ventas</h3>
        <p className="mt-1 text-xs text-slate-600">
          Obligatorio para publicar productos. Los compradores podran escribirte
          desde el detalle del producto.
        </p>
      </div>
      <Input
        error={errors.whatsapp}
        helperText="Solo numeros, con codigo de pais (ej. 573001234567)."
        label="Numero de WhatsApp"
        name="whatsapp"
        onChange={(event) => setWhatsapp(event.target.value)}
        type="tel"
        value={whatsapp}
      />
    </div>
  ) : null;

  const formFields = (
    <>
      {layout === "default" ? (
        <>
          <ProfileCountrySelect
            error={errors.country}
            onChange={setCountry}
            value={country}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs leading-5 text-slate-600">
            Moneda actual en tu cuenta:{" "}
            <span className="font-semibold text-slate-900">{currencyPreview}</span>
          </div>
        </>
      ) : null}

      <div className={layout === "wide" ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
        <Input
          error={errors.fullName}
          label="Nombre publico"
          name="fullName"
          onChange={(event) => setFullName(event.target.value)}
          type="text"
          value={fullName}
        />
        <Input
          error={errors.username}
          helperText="Opcional. Entre 3 y 32 caracteres, solo letras, numeros y _."
          label="Nombre de usuario"
          name="username"
          onChange={(event) => setUsername(event.target.value)}
          type="text"
          value={username}
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-semibold text-slate-800" htmlFor="profile-bio">
          Bio
        </label>
        <textarea
          className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
          id="profile-bio"
          maxLength={500}
          name="bio"
          onChange={(event) => setBio(event.target.value)}
          placeholder="Cuentale a la comunidad sobre ti (opcional)."
          value={bio}
        />
        {errors.bio ? <p className="text-xs text-red-600">{errors.bio}</p> : null}
      </div>

      {buyerShippingFields}
      {sellerWhatsappField}

      {status ? (
        <p
          className={
            status.includes("actualizado")
              ? "rounded-xl bg-brand-light px-4 py-2 text-sm text-brand-dark"
              : "rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700"
          }
        >
          {status}
        </p>
      ) : null}

      <Button className="w-full sm:w-auto" disabled={isLoading} type="submit">
        {isLoading ? "Guardando..." : "Guardar perfil"}
      </Button>
    </>
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <PencilLine aria-hidden className="h-5 w-5 text-brand" />
          <h2 className="text-base font-black text-slate-950 sm:text-lg">
            Editar perfil
          </h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {isBuyer
            ? "Completa tus datos de envio para poder comprar en el marketplace."
            : isSeller
              ? "Incluye tu WhatsApp para publicar y que los compradores te contacten."
              : "Foto, pais y datos publicos de tu cuenta."}
        </p>
      </div>

      {layout === "wide" ? (
        <div className="p-5 sm:p-6 lg:grid lg:grid-cols-[minmax(220px,260px)_1fr] lg:gap-8">
          <div className="space-y-4">
            <ProfileAvatarEditor
              fullName={fullName}
              initialAvatarUrl={profile.avatarUrl}
            />
            <ProfileCountrySelect
              error={errors.country}
              onChange={setCountry}
              value={country}
            />
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs leading-5 text-slate-600">
              Moneda actual:{" "}
              <span className="font-semibold text-slate-900">{currencyPreview}</span>
            </div>
          </div>

          <form className="mt-6 space-y-4 lg:mt-0" noValidate onSubmit={handleSubmit}>
            {formFields}
          </form>
        </div>
      ) : (
        <div className="space-y-6 p-6 sm:p-8">
          <ProfileAvatarEditor
            fullName={fullName}
            initialAvatarUrl={profile.avatarUrl}
          />
          <form className="space-y-4" noValidate onSubmit={handleSubmit}>
            {formFields}
          </form>
        </div>
      )}
    </section>
  );
}
