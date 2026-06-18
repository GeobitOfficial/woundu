import { getAuthenticatedProfile } from "@/services/supabase/auth/getAuthenticatedProfile";
import { getAuthenticatedUser } from "@/services/supabase/auth/getAuthenticatedUser";
import { canAccessSellerFeatures, isSuperAdmin } from "@/lib/auth/roles";

import { SiteHeaderClient } from "./SiteHeaderClient";
import {
  getRecentNotificationsForUser,
  getUnreadNotificationCount,
} from "@/features/notifications/services/notificationReadService";

export async function SiteHeader() {
  const user = await getAuthenticatedUser();
  const profile = user ? await getAuthenticatedProfile() : null;
  const [notifications, unreadCount] = user
    ? await Promise.all([
        getRecentNotificationsForUser(user.id, 8),
        getUnreadNotificationCount(user.id),
      ])
    : [[], 0];

  return (
    <SiteHeaderClient
      canPublish={canAccessSellerFeatures(profile?.role)}
      displayName={profile?.fullName ?? user?.user_metadata?.full_name ?? user?.email ?? null}
      initialNotifications={notifications}
      isLoggedIn={Boolean(user)}
      isSuperAdmin={isSuperAdmin(profile?.role)}
      profileAvatarUrl={profile?.avatarUrl ?? null}
      unreadCount={unreadCount}
    />
  );
}