"use server";

import { getCurrentUser } from "@/lib/auth-server";
import { getUserById, updateUser } from "@/lib/db";
import { cloudinary } from "@/lib/cloudinary";
import { randomBytes } from 'crypto';
import { rateLimiter } from "@/lib/rate-limit";

// Generate signature untuk signed upload ke Cloudinary
export async function generateSignature(): Promise<{
  signature: string;
  timestamp: number;
  folder: string;
  public_id: string;
  apiKey: string;
  cloudName: string;
}> {
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    throw new Error("Unauthorized");
  }

  // Rate limiting dengan Redis (5 request per menit)
  const { success, limit, reset } = await rateLimiter.limit(currentUser.id);
  if (!success) {
    const resetInSeconds = Math.ceil((reset - Date.now()) / 1000);
    throw new Error(
      `Rate limit exceeded. Maksimal ${limit} request per menit. Coba lagi dalam ${resetInSeconds} detik.`
    );
  }

  // Validasi environment variables
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiKey) {
    throw new Error("CLOUDINARY_API_KEY tidak ditemukan di environment");
  }
  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME tidak ditemukan di environment");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'avatars';
  const publicId = `avatar_${currentUser.id}_${randomBytes(4).toString('hex')}_${timestamp}`;

  const paramsToSign = {
    timestamp,
    folder,
    public_id: publicId,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    folder,
    public_id: publicId,
    apiKey,
    cloudName,
  };
}

// Update profil (nama, telepon, avatar URL)
export async function updateProfile(formData: FormData) {
  const name = formData.get('name') as string | null;
  const phone = formData.get('phone') as string | null;
  const avatarUrl = formData.get('avatarUrl') as string | null;

  if (!name?.trim()) {
    return { success: false, error: "Nama harus diisi" };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return { success: false, error: "Anda harus login" };
  }

  const userFromDb = await getUserById(currentUser.id);
  if (!userFromDb) {
    return { success: false, error: "User tidak ditemukan" };
  }

  const updateData: { name: string; avatar?: string; phone?: string } = {
    name: name.trim(),
    phone: phone?.trim() || undefined,
  };

  if (avatarUrl) {
    updateData.avatar = avatarUrl;

    // Hapus avatar lama dari Cloudinary (opsional)
    if (userFromDb.avatar) {
      const oldUrl = userFromDb.avatar;
      const matches = oldUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/);
      if (matches && matches[1]) {
        try {
          await cloudinary.uploader.destroy(matches[1]);
        } catch (err) {
          console.error("Gagal hapus avatar lama:", err);
        }
      }
    }
  }

  try {
    await updateUser(currentUser.id, updateData);
    return { success: true };
  } catch (error) {
    console.error("Gagal update profil:", error);
    return { success: false, error: "Terjadi kesalahan saat menyimpan" };
  }
}