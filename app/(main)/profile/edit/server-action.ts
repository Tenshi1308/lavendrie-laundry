"use server";

import { getCurrentUser } from "@/lib/auth-server";
import { getUserById, updateUser } from "@/lib/db";
import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

// Konfigurasi upload
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads/avatars');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Pastikan direktori ada
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function updateProfile(formData: FormData) {
  // 1. Ambil data dari FormData
  const name = formData.get('name') as string | null;
  const avatarFile = formData.get('avatar') as File | null;

  // 2. Validasi nama
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return { success: false, error: "Nama harus diisi" };
  }

  // 3. Dapatkan user dari session
  const currentUser = await getCurrentUser();
  if (!currentUser?.id) {
    return { success: false, error: "Anda harus login" };
  }

  // 4. Ambil user dari database (untuk avatar lama)
  const userFromDb = await getUserById(currentUser.id);
  if (!userFromDb) {
    return { success: false, error: "User tidak ditemukan" };
  }

  // 5. Siapkan data update
  const phone = formData.get('phone') as string | null;
  const updateData: { name: string; avatar?: string; phone?: string } = {
    name: name.trim(),
    phone: phone?.trim() || undefined
  };

  // 6. Proses avatar jika ada file
  if (avatarFile && avatarFile.size > 0) {
    // Validasi ukuran
    if (avatarFile.size > MAX_FILE_SIZE) {
      return { success: false, error: "Ukuran file maksimal 2MB" };
    }
    // Validasi tipe
    if (!ALLOWED_TYPES.includes(avatarFile.type)) {
      return { success: false, error: "Tipe file tidak diizinkan. Gunakan JPG, PNG, WEBP, atau GIF" };
    }

    // Generate nama unik
    const ext = path.extname(avatarFile.name) || '.jpg';
    const fileName = `avatar-${Date.now()}-${randomBytes(4).toString('hex')}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Simpan file
    await ensureUploadDir();
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // URL untuk diakses publik
    const avatarUrl = `/uploads/avatars/${fileName}`;
    updateData.avatar = avatarUrl;

    // Hapus avatar lama jika ada
    if (userFromDb.avatar) {
      const oldPath = path.join(process.cwd(), 'public', userFromDb.avatar);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        // Abaikan jika file tidak ada
      }
    }
  }

  // 7. Simpan perubahan ke database (hanya nama dan avatar)
  try {
    await updateUser(currentUser.id, updateData);
    return { success: true };
  } catch (error) {
    console.error("Gagal update profil:", error);
    return { success: false, error: "Terjadi kesalahan saat menyimpan" };
  }
}