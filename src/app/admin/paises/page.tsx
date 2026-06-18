import { CountryCurrencyManagement } from "@/components/admin/CountryCurrencyManagement";
import { getAllCountryCurrenciesForAdmin } from "@/features/admin/services/adminReadService";

export default async function AdminCountriesPage() {
  const countries = await getAllCountryCurrenciesForAdmin();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-black tracking-tight text-slate-950">
          Países y monedas
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Define la moneda que se aplica a cada país del marketplace. Los productos
          nuevos o editados heredan la moneda según el país de publicación.
        </p>
      </section>

      <CountryCurrencyManagement initialCountries={countries} />
    </div>
  );
}
