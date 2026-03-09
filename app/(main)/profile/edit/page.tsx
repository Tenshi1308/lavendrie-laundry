import { getCurrentUser } from "@/lib/auth-server";
import { EditProfileForm } from "./EditProfileForm";
import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
      <EditProfileForm
        user={{
          name: user.name || "",
          email: user.email || "",
          avatar: user.avatar || null,
          phone: user.phone || "",
        }}
      />
    </div>
  );
}