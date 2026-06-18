import type { SellerPayoutMethod, SellerPayoutProfile } from "@/features/orders/types";
import {
  getPayoutAccountTypeLabel,
  getPayoutEntityLabel,
} from "@/constants/payoutAccountTypes";
import { cn } from "@/lib/utils";

type SellerPayoutMethodsDisplayProps = Readonly<{
  payout: SellerPayoutProfile | null;
  compact?: boolean;
  className?: string;
}>;

export function SellerPayoutMethodsDisplay({
  className,
  compact = false,
  payout,
}: SellerPayoutMethodsDisplayProps) {
  if (!payout || payout.methods.length === 0) {
    return (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
        El vendedor aún no configuró sus métodos de cobro.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {payout.methods.map((method) => (
        <PayoutMethodCard compact={compact} key={method.id} method={method} />
      ))}
    </div>
  );
}

function PayoutMethodCard({
  compact,
  method,
}: Readonly<{ compact?: boolean; method: SellerPayoutMethod }>) {
  return (
    <dl
      className={cn(
        "rounded-xl border border-slate-200 bg-white text-sm",
        compact ? "p-3" : "p-4",
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-[11px] font-bold text-brand-dark">
          {getPayoutAccountTypeLabel(method.accountType)}
        </span>
        {method.isPrimary ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            Principal
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {getPayoutEntityLabel(method.accountType)}
          </dt>
          <dd className="font-medium text-slate-900">{method.entityName}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Titular
          </dt>
          <dd className="font-medium text-slate-900">{method.accountHolder}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Número de cuenta
          </dt>
          <dd className="font-mono text-base font-semibold text-slate-950">
            {method.accountNumber}
          </dd>
        </div>
      </div>

      {method.instructions ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Instrucciones
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-slate-700">
            {method.instructions}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}
