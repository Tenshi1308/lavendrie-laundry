"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import Cropper from "react-easy-crop";
import { updateProfile } from "./server-action";
import { toast } from "sonner";
import Link from "next/link";

// Konstanta (salin dari server-action agar konsisten)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface EditProfileFormProps {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    phone: string;
  };
}

// Helper untuk membuat image dari URL
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Fungsi untuk memotong gambar berdasarkan area crop
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  if (ctx) {
    // Isi background putih untuk gambar transparan (PNG)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob!);
      },
      "image/jpeg",
      0.9 // kualitas 90%
    );
  });
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatar || null
  );

  // State untuk crop
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);

  // Bersihkan object URL saat komponen unmount
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (cropImageUrl && cropImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(cropImageUrl);
      }
    };
  }, [avatarPreview, cropImageUrl]);

  // Handler saat user memilih file
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      // Reset jika batal pilih
      setAvatarPreview(user.avatar || null);
      setCroppedFile(null);
      setSelectedFile(null);
      return;
    }

    // Validasi ukuran & tipe
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 5MB");
      e.target.value = ""; // reset input
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Tipe file tidak diizinkan. Gunakan JPG, PNG, WEBP, atau GIF");
      e.target.value = "";
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Buat URL untuk ditampilkan di cropper
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageUrl(reader.result as string);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);
  }

  // Simpan area crop yang dipilih
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handler tombol "Simpan" di dialog crop
  const handleCropSave = async () => {
    if (!cropImageUrl || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImg(cropImageUrl, croppedAreaPixels);
      const newFile = new File(
        [croppedBlob],
        selectedFile?.name || "avatar.jpg",
        { type: "image/jpeg" }
      );

      // Buat preview dari hasil crop
      const previewUrl = URL.createObjectURL(croppedBlob);
      setAvatarPreview(previewUrl);
      setCroppedFile(newFile);
      setShowCropDialog(false);
    } catch (err) {
      console.error("Gagal memotong gambar:", err);
      setError("Gagal memproses gambar. Silakan coba lagi.");
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Jika ada hasil crop, gunakan file yang sudah di-crop
    if (croppedFile) {
      formData.delete("avatar"); // hapus file asli (jika ada)
      formData.append("avatar", croppedFile);
    }

    // Validasi nama
    const name = formData.get("name") as string;
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

  return (
    <>
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
                  Maksimal 5MB. Format: JPG, PNG, WEBP, GIF
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

            {error && <p className="text-sm text-destructive">{error}</p>}
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

      {/* Dialog Crop */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="bg-transparent border-gray-500 backdrop-blur-sm shadow-none w-screen h-auto p-6 m-0 [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Sesuaikan Foto Profil</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
            {cropImageUrl && (
              <Cropper
                image={cropImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1} // aspek persegi 1:1
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="py-2">
            <p className="text-sm mb-2">Zoom</p>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
            />
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCropDialog(false);
                // Reset input file (opsional)
                const fileInput = document.getElementById(
                  "avatar"
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
              }}
            >
              Batal
            </Button>
            <Button onClick={handleCropSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}