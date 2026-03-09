
import { ProfileCardServer } from "./server-action";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      <ProfileCardServer />
    </div>
  )
}