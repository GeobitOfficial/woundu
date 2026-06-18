"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import type { UserNotification } from "@/features/notifications/types";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/services/notificationMutations";
import { formatAccountDate } from "@/lib/account/orderStatusUi";
import { cn } from "@/lib/utils";

type NotificationListProps = Readonly<{
  notifications: ReadonlyArray<UserNotification>;
}>;

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  async function handleRead(notification: UserNotification) {
    if (notification.readAt) {
      return;
    }

    await markNotificationRead(notification.id);
    router.refresh();
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    router.refresh();
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-600">
        Aún no tienes notificaciones.
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 ? (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => void handleMarkAll()} variant="secondary">
            Marcar todas como leídas
          </Button>
        </div>
      ) : null}

      <ul className="space-y-3">
        {notifications.map((notification) => (
          <li
            className={cn(
              "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
              !notification.readAt && "border-brand/20 bg-brand-light/10",
            )}
            key={notification.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-950">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {formatAccountDate(notification.createdAt)}
                </p>
              </div>
              {!notification.readAt ? (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Nueva
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {notification.href ? (
                <Link
                  className="text-sm font-bold text-brand hover:underline"
                  href={notification.href}
                  onClick={() => void handleRead(notification)}
                >
                  Abrir
                </Link>
              ) : null}
              {!notification.readAt ? (
                <button
                  className="text-sm font-semibold text-slate-600 hover:text-slate-950"
                  onClick={() => void handleRead(notification)}
                  type="button"
                >
                  Marcar leída
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
