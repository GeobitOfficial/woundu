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

import { updateProfileSchema } from "@/validations/profile";



type AccountProfileCardProps = Readonly<{

  profile: AccountProfileView;

}>;



export function AccountProfileCard({ profile }: AccountProfileCardProps) {

  const router = useRouter();

  const [fullName, setFullName] = useState(profile.fullName);

  const [username, setUsername] = useState(profile.username ?? "");

  const [bio, setBio] = useState(profile.bio ?? "");

  const [country, setCountry] = useState(profile.country ?? "");

  const [errors, setErrors] = useState<{

    fullName?: string;

    username?: string;

    bio?: string;

    country?: string;

  }>({});

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

      const values = updateProfileSchema.parse({

        fullName,

        username,

        bio,

        country,

      });

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

        const nextErrors: typeof errors = {};

        for (const issue of error.issues) {

          const field = issue.path[0];

          if (

            field === "fullName" ||

            field === "username" ||

            field === "bio" ||

            field === "country"

          ) {

            nextErrors[field] = issue.message;

          }

        }

        setErrors(nextErrors);

        return;

      }

      setStatus("No pudimos guardar. Intentalo de nuevo.");

    }

  }



  return (

    <section className="overflow-hidden rounded-[2rem] border border-brand/20 bg-white/95 shadow-xl shadow-brand/10 backdrop-blur-sm">

      <div className="border-b border-brand/10 bg-gradient-to-r from-brand-light/70 via-white to-violet-50/60 px-6 py-5 sm:px-8">

        <div className="flex items-center gap-2">

          <PencilLine aria-hidden className="h-5 w-5 text-brand" />

          <h2 className="text-lg font-black text-slate-950">Editar perfil</h2>

        </div>

        <p className="mt-1 text-sm text-slate-600">

          Actualiza tu foto, pais de cuenta y datos publicos.

        </p>

      </div>



      <div className="space-y-6 p-6 sm:p-8">

        <ProfileAvatarEditor

          fullName={fullName}

          initialAvatarUrl={profile.avatarUrl}

        />



        <form className="space-y-4" noValidate onSubmit={handleSubmit}>

          <ProfileCountrySelect

            error={errors.country}

            onChange={setCountry}

            value={country}

          />



          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs leading-5 text-slate-600">

            Moneda actual en tu cuenta:{" "}

            <span className="font-semibold text-slate-900">{currencyPreview}</span>

          </div>



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

          <div className="grid gap-1.5">

            <label

              className="text-sm font-semibold text-slate-800"

              htmlFor="profile-bio"

            >

              Bio

            </label>

            <textarea

              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"

              id="profile-bio"

              maxLength={500}

              name="bio"

              onChange={(event) => setBio(event.target.value)}

              placeholder="Cuentale a la comunidad sobre ti (opcional)."

              value={bio}

            />

            {errors.bio ? (

              <p className="text-xs text-red-600">{errors.bio}</p>

            ) : null}

          </div>



          {status ? (

            <p

              className={

                status.includes("actualizado")

                  ? "rounded-2xl bg-brand-light px-4 py-2 text-sm text-brand-dark"

                  : "rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700"

              }

            >

              {status}

            </p>

          ) : null}



          <Button className="w-full sm:w-auto" disabled={isLoading} type="submit">

            {isLoading ? "Guardando..." : "Guardar perfil"}

          </Button>

        </form>

      </div>

    </section>

  );

}


