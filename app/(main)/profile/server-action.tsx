import { getCurrentUser } from "@/lib/auth-server";
import { ProfileCardClient } from "./ProfileCard";

export async function ProfileCardServer() {
  const stats = await getCurrentUser();
  const user = {
    name: stats?.name || "Demo User",
    email: stats?.email || "demo@example.com",
    avatar: stats?.avatar || "",
    role: stats?.role || "customer",
    phone: stats?.phone || "N/A",
    memberSince: stats?.createdAt
      ? new Date(stats.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString(),
  };

  return <ProfileCardClient user={user} />;
}