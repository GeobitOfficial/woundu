"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import type { UserNotification } from "@/features/notifications/types";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/services/notificationMutations";
import { formatAccountDate } from "@/lib/account/orderStatusUi";
import { cn } from "@/lib/utils";

type NotificationBellProps = Readonly<{
  initialNotifications: ReadonlyArray<UserNotification>;
  unreadCount: number;
  tone?: "header" | "panel";
}>;

export function NotificationBell({
  initialNotifications,
  tone = "header",
  unreadCount,
}: NotificationBellProps) {
  const router = useRouter();

  async function handleOpenNotification(notification: UserNotification) {
    if (!notification.readAt) {
      await markNotificationRead(notification.id);
      router.refresh();
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    router.refresh();
  }

  return (
    <details className="relative">
      <summary
        aria-label={
          unreadCount > 0
            ? `Notificaciones, ${unreadCount} sin leer`
            : "Notificaciones"
        }
        className={cn(
          "relative flex h-10 cursor-pointer list-none items-center justify-center rounded-full px-3 transition [&::-webkit-details-marker]:hidden",
          tone === "header"
            ? "border border-white/30 bg-white/10 text-white hover:bg-white/20"
            : "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100",
        )}
      >
        <Bell aria-hidden className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </summary>

      <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-black text-slate-950">Notificaciones</p>
          {unreadCount > 0 ? (
            <button
              className="text-xs font-bold text-brand hover:underline"
              onClick={() => void handleMarkAllRead()}
              type="button"
            >
              Marcar todas
            </button>
          ) : null}
        </div>

        {initialNotifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            No tienes notificaciones todavía.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {initialNotifications.map((notification) => (
              <li
                className={cn(
                  "border-b border-slate-100 last:border-b-0",
                  !notification.readAt && "bg-brand-light/20",
                )}
                key={notification.id}
              >
                {notification.href ? (
                  <Link
                    className="block px-4 py-3 transition hover:bg-slate-50"
                    href={notification.href}
                    onClick={() => void handleOpenNotification(notification)}
                  >
                    <NotificationItem notification={notification} />
                  </Link>
                ) : (
                  <div className="px-4 py-3">
                    <NotificationItem notification={notification} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-slate-100 px-4 py-3">
          <Link
            className="text-xs font-bold text-brand hover:underline"
            href="/cuenta/notificaciones"
          >
            Ver todas →
          </Link>
        </div>
      </div>
    </details>
  );
}

function NotificationItem({
  notification,
}: Readonly<{ notification: UserNotification }>) {
  return (
    <>
      <p className="text-sm font-semibold text-slate-950">{notification.title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{notification.body}</p>
      <p className="mt-2 text-[11px] text-slate-400">
        {formatAccountDate(notification.createdAt)}
      </p>
    </>
  );
}
