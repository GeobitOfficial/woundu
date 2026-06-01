"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ZodError } from "zod";

import { Button, Input } from "@/components/ui";
import { updateProfile } from "@/features/account/services/profileMutations";
import { updateProfileSchema } from "@/validations/profile";

type ProfileEditFormProps = Readonly<{
  initialFullName: string;
  initialUsername: string;
  initialBio: string;
}>;

export function ProfileEditForm({
  initialBio,
  initialFullName,
  initialUsername,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [errors, setErrors] = useState<{
    fullName?: string;
    username?: string;
    bio?: string;
  }>({});
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setErrors({});

    try {
      const values = updateProfileSchema.parse({
        fullName,
        username,
        bio,
      });
      setIsLoading(true);
      const { error } = await updateProfile(values);
      setIsLoading(false);

      if (error) {
        setStatus(error);
        return;
      }

      setStatus("Cambios guardados.");
      router.refresh();
    } catch (error) {
      setIsLoading(false);
      if (error instanceof ZodError) {
        const nextErrors: typeof errors = {};
        for (const issue of error.issues) {
          const field = issue.path[0];
          if (field === "fullName" || field === "username" || field === "bio") {
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
    <form className="mt-4 space-y-4" noValidate onSubmit={handleSubmit}>
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
          className="text-xs font-semibold text-slate-700"
          htmlFor="profile-bio"
        >
          Bio
        </label>
        <textarea
          className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm shadow-slate-950/5 transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-950/5"
          id="profile-bio"
          maxLength={500}
          name="bio"
          onChange={(event) => setBio(event.target.value)}
          placeholder="Cuéntale a la comunidad sobre ti (opcional)."
          value={bio}
        />
        {errors.bio ? (
          <p className="text-xs text-red-600">{errors.bio}</p>
        ) : null}
      </div>

      {status ? (
        <p
          className={
            status.includes("guardados")
              ? "rounded-2xl bg-brand-light px-4 py-2 text-sm text-brand-dark"
              : "rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700"
          }
        >
          {status}
        </p>
      ) : null}

      <Button disabled={isLoading} type="submit">
        {isLoading ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
