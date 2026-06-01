export type SellerEarningsPeriodKind = "month" | "semester" | "year";

export type SellerEarningsFilter = Readonly<{
  kind: SellerEarningsPeriodKind;
  year: number;
  month: number;
  semester: 1 | 2;
}>;

export type SellerEarningsDateRange = Readonly<{
  startIso: string;
  endIso: string;
  label: string;
}>;

const PERIOD_KINDS: ReadonlySet<string> = new Set(["month", "semester", "year"]);

function readParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function clampYear(year: number, minYear: number, maxYear: number): number {
  return Math.min(maxYear, Math.max(minYear, year));
}

function clampMonth(month: number): number {
  return Math.min(12, Math.max(1, month));
}

export function getDefaultSellerEarningsFilter(
  referenceDate: Date = new Date(),
): SellerEarningsFilter {
  return {
    kind: "month",
    year: referenceDate.getFullYear(),
    month: referenceDate.getMonth() + 1,
    semester: referenceDate.getMonth() < 6 ? 1 : 2,
  };
}

export function parseSellerEarningsFilter(
  searchParams: Record<string, string | string[] | undefined>,
  referenceDate: Date = new Date(),
): SellerEarningsFilter {
  const defaults = getDefaultSellerEarningsFilter(referenceDate);
  const kindRaw = readParam(searchParams.periodo)?.trim() ?? defaults.kind;
  const kind: SellerEarningsPeriodKind = PERIOD_KINDS.has(kindRaw)
    ? (kindRaw as SellerEarningsPeriodKind)
    : defaults.kind;

  const monthInput = readParam(searchParams.mes)?.trim();
  let year = defaults.year;
  let month = defaults.month;
  let semester: 1 | 2 = defaults.semester;

  if (monthInput && /^\d{4}-\d{2}$/.test(monthInput)) {
    const [yearPart, monthPart] = monthInput.split("-");
    year = clampYear(Number.parseInt(yearPart, 10), 2020, referenceDate.getFullYear());
    month = clampMonth(Number.parseInt(monthPart, 10));
    semester = month <= 6 ? 1 : 2;
  } else {
    const yearRaw = readParam(searchParams.anio);
    if (yearRaw && /^\d{4}$/.test(yearRaw)) {
      year = clampYear(Number.parseInt(yearRaw, 10), 2020, referenceDate.getFullYear());
    }

    const monthRaw = readParam(searchParams.mes_num);
    if (monthRaw && /^\d{1,2}$/.test(monthRaw)) {
      month = clampMonth(Number.parseInt(monthRaw, 10));
      semester = month <= 6 ? 1 : 2;
    }

    const semesterRaw = readParam(searchParams.semestre);
    if (semesterRaw === "1" || semesterRaw === "2") {
      semester = Number.parseInt(semesterRaw, 10) as 1 | 2;
    }
  }

  return { kind, year, month, semester };
}

function monthLabel(year: number, month: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("es", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function semesterLabel(year: number, semester: 1 | 2): string {
  return semester === 1
    ? `1.er semestre ${year} (ene–jun)`
    : `2.º semestre ${year} (jul–dic)`;
}

export function getSellerEarningsDateRange(
  filter: SellerEarningsFilter,
): SellerEarningsDateRange {
  if (filter.kind === "month") {
    const start = new Date(Date.UTC(filter.year, filter.month - 1, 1));
    const end = new Date(Date.UTC(filter.year, filter.month, 1));
    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      label: monthLabel(filter.year, filter.month),
    };
  }

  if (filter.kind === "semester") {
    const startMonth = filter.semester === 1 ? 0 : 6;
    const endMonth = filter.semester === 1 ? 6 : 12;
    const start = new Date(Date.UTC(filter.year, startMonth, 1));
    const end = new Date(Date.UTC(filter.year, endMonth, 1));
    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
      label: semesterLabel(filter.year, filter.semester),
    };
  }

  const start = new Date(Date.UTC(filter.year, 0, 1));
  const end = new Date(Date.UTC(filter.year + 1, 0, 1));
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    label: `Año ${filter.year}`,
  };
}

export function toMonthInputValue(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function buildSellerEarningsHref(filter: SellerEarningsFilter): string {
  const params = new URLSearchParams();
  params.set("periodo", filter.kind);

  if (filter.kind === "month") {
    params.set("mes", toMonthInputValue(filter.year, filter.month));
  } else if (filter.kind === "semester") {
    params.set("anio", String(filter.year));
    params.set("semestre", String(filter.semester));
  } else {
    params.set("anio", String(filter.year));
  }

  return `/cuenta/ventas?${params.toString()}`;
}
