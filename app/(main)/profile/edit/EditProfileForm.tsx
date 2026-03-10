"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile } from "./server-action";
import { toast } from "sonner";
import Link from "next/link";

interface EditProfileFormProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    phone: string;
  };
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Validasi sederhana di client
    const name = formData.get('name') as string;
    if (!name?.trim()) {
      setError("Nama harus diisi");
      setIsLoading(false);
      return;
    }

    const result = await updateProfile(formData);
    if (result.success) {
      toast.success("Profil berhasil diperbarui");
      router.push("/profile");
      router.refresh();
    } else {
      setError(result.error || "Terjadi kesalahan");
      setIsLoading(false);
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(user.avatar || null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profil</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || ""} />
              <AvatarFallback className="text-2xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="avatar">Foto Profil</Label>
              <Input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                disabled={isLoading}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maksimal 2MB. Format: JPG, PNG, WEBP, GIF
              </p>
            </div>
          </div>

          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              disabled={isLoading}
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email (tidak dapat diubah)</Label>
            <Input
              id="email"
              name="email"
              value={user.email}
              disabled
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={user.phone}
              disabled={isLoading}
            />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Ingin mengganti password?
            </p>
            <Link
              href={`/verify-phone?email=${encodeURIComponent(user.email)}`}
              className="text-sm text-primary hover:underline inline-flex items-center"
            >
              Ganti Password
            </Link>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-6"
          >
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}