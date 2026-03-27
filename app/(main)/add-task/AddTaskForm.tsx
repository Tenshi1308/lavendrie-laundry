"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createOrder } from "./server-action"
import { MapPin, Loader2, CheckCircle2, AlertCircle, ChevronDown, User, Phone, Calendar, Shirt, ChevronUp } from "lucide-react"

interface AddressDetail {
  namaTempatAtauJalan: string
  nomorRumah: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kota: string
  provinsi: string
  kodePos: string
}

export function AddTaskForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationStatus, setLocationStatus] = useState<"idle" | "success" | "error">("idle")
  const [showAddressDetail, setShowAddressDetail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    orderDate: "",
    serviceType: "",
    duration: "",
    workType: "",
    customerName: "",
    phone: "",
  })

  const [addressDetail, setAddressDetail] = useState<AddressDetail>({
    namaTempatAtauJalan: "",
    nomorRumah: "",
    rt: "",
    rw: "",
    kelurahan: "",
    kecamatan: "",
    kota: "",
    provinsi: "",
    kodePos: "",
  })

  function handleChange(field: string, value: string) {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      if (field === "serviceType" && value === "Ambil") {
        newData.duration = ""
        newData.workType = ""
      }
      return newData
    })
  }

  function handleAddressChange(field: keyof AddressDetail, value: string) {
    setAddressDetail((prev) => ({ ...prev, [field]: value }))
  }

  function buildFullAddress(): string {
    const parts = [
      addressDetail.namaTempatAtauJalan,
      addressDetail.nomorRumah ? `No. ${addressDetail.nomorRumah}` : "",
      addressDetail.rt && addressDetail.rw
        ? `RT ${addressDetail.rt}/RW ${addressDetail.rw}`
        : addressDetail.rt
          ? `RT ${addressDetail.rt}`
          : addressDetail.rw
            ? `RW ${addressDetail.rw}`
            : "",
      addressDetail.kelurahan ? `Kel. ${addressDetail.kelurahan}` : "",
      addressDetail.kecamatan ? `Kec. ${addressDetail.kecamatan}` : "",
      addressDetail.kota,
      addressDetail.provinsi,
      addressDetail.kodePos,
    ].filter(Boolean)
    return parts.join(", ")
  }

  async function handleDetectLocation() {
    if (!navigator.geolocation) { setLocationStatus("error"); return }
    setIsLocating(true)
    setLocationStatus("idle")

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "id" } }
          )
          const data = await res.json()
          const addr = data.address
          setAddressDetail({
            namaTempatAtauJalan: addr.road || addr.pedestrian || addr.footway || addr.path || "",
            nomorRumah: addr.house_number || "",
            rt: "",
            rw: "",
            kelurahan: addr.village || addr.suburb || addr.neighbourhood || "",
            kecamatan: addr.city_district || addr.town || addr.municipality || "",
            kota: addr.city || addr.county || "",
            provinsi: addr.state || "",
            kodePos: addr.postcode || "",
          })
          setLocationStatus("success")
          setShowAddressDetail(true)
        } catch {
          setLocationStatus("error")
        } finally {
          setIsLocating(false)
        }
      },
      () => { setIsLocating(false); setLocationStatus("error") },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const fullAddress = buildFullAddress()
    const result = await createOrder({ ...formData, address: fullAddress })

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push("/history")
    }
  }

  const showLaundryDetails = formData.serviceType !== "Ambil"

  return (
    <div className="min-h-screen bg-gray-50/50 px-4">
      <div className="max-w-auto mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Info Customer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Info Customer</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">
                  Nama Customer <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    id="customerName"
                    placeholder="Masukkan nama customer"
                    value={formData.customerName}
                    onChange={(e) => handleChange("customerName", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-9 border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  No. Telepon <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    id="phone"
                    placeholder="Contoh: 081234567890"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-9 border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Detail Order */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <Shirt className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail Order</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="orderDate" className="text-sm font-medium text-gray-700">
                  Tanggal Order <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
                  <Input
                    id="orderDate"
                    type="date"
                    value={formData.orderDate}
                    onChange={(e) => handleChange("orderDate", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-9 border-gray-200 focus:border-blue-400 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Jenis Layanan <span className="text-red-400">*</span>
                  <p className="text-xs text-gray-400 font-normal">"Antar" jika ingin melakukan laundry, "Ambil" jika ingin mengambil laundry</p>
                </Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(v) => handleChange("serviceType", v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-100">
                    <SelectValue placeholder="Pilih layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Antar">Antar</SelectItem>
                    <SelectItem value="Ambil">Ambil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showLaundryDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Durasi Layanan <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(v) => handleChange("duration", v)}
                      disabled={isSubmitting}
                      required={showLaundryDetails}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-100">
                        <SelectValue placeholder="Pilih durasi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Express">Express</SelectItem>
                        <SelectItem value="Kilat">Kilat</SelectItem>
                        <SelectItem value="Reguler">Reguler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      Jenis Pengerjaan <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.workType}
                      onValueChange={(v) => handleChange("workType", v)}
                      disabled={isSubmitting}
                      required={showLaundryDetails}
                    >
                      <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-100">
                        <SelectValue placeholder="Pilih pengerjaan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Dry Clean">Dry Clean</SelectItem>
                        <SelectItem value="Laundry Satuan">Laundry Satuan</SelectItem>
                        <SelectItem value="Laundry Kiloan">Laundry Kiloan</SelectItem>
                        <SelectItem value="Mix">Mix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Alamat */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alamat</span>
            </div>
            <div className="p-5 space-y-3">
              {/* Tombol deteksi lokasi */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating || isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLocating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Mendeteksi lokasi...</>
                ) : (
                  <><MapPin className="h-4 w-4" /> {locationStatus === "success" ? "Deteksi Ulang Lokasi" : "Gunakan Lokasi Saya Sekarang"}</>
                )}
              </button>

              {locationStatus === "success" && (
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Lokasi terdeteksi. Lengkapi detail lainnya jika perlu.
                </div>
              )}

              {locationStatus === "error" && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Gagal mendapatkan lokasi. Isi alamat manual di bawah.
                </div>
              )}

              {!showAddressDetail && (
                <button
                  type="button"
                  onClick={() => setShowAddressDetail(true)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Isi alamat manual
                </button>
              )}

              {showAddressDetail && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">
                      Nama Kost / Rumah / Jalan <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      placeholder="Contoh: Kost Melati / Jl. Mawar / Perum. Griya Asri"
                      value={addressDetail.namaTempatAtauJalan}
                      onChange={(e) => handleAddressChange("namaTempatAtauJalan", e.target.value)}
                      disabled={isSubmitting}
                      className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">Nomor Rumah / Kamar</Label>
                    <Input
                      placeholder="Contoh: 12 / B3 / 4A"
                      value={addressDetail.nomorRumah}
                      onChange={(e) => handleAddressChange("nomorRumah", e.target.value)}
                      disabled={isSubmitting}
                      className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">RT</Label>
                      <Input
                        placeholder="Contoh: 003"
                        value={addressDetail.rt}
                        onChange={(e) => handleAddressChange("rt", e.target.value)}
                        disabled={isSubmitting}
                        className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">RW</Label>
                      <Input
                        placeholder="Contoh: 007"
                        value={addressDetail.rw}
                        onChange={(e) => handleAddressChange("rw", e.target.value)}
                        disabled={isSubmitting}
                        className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Kelurahan / Desa</Label>
                      <Input
                        placeholder="Contoh: Pinangsia"
                        value={addressDetail.kelurahan}
                        onChange={(e) => handleAddressChange("kelurahan", e.target.value)}
                        disabled={isSubmitting}
                        className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Kecamatan</Label>
                      <Input
                        placeholder="Contoh: Tamansari"
                        value={addressDetail.kecamatan}
                        onChange={(e) => handleAddressChange("kecamatan", e.target.value)}
                        disabled={isSubmitting}
                        className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Kota / Kabupaten</Label>
                      <Input
                        placeholder="Contoh: Jakarta Barat"
                        value={addressDetail.kota}
                        onChange={(e) => handleAddressChange("kota", e.target.value)}
                        disabled={isSubmitting}
                        className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-600">Kode Pos</Label>
                      <Input
                        placeholder="Contoh: 11110"
                        value={addressDetail.kodePos}
                        onChange={(e) => handleAddressChange("kodePos", e.target.value)}
                        disabled={isSubmitting}
                        className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {buildFullAddress() && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1">
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Preview Alamat</p>
                      <p className="text-sm text-blue-900">{buildFullAddress()}</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-600">
                      Catatan Tambahan <span className="text-gray-400">(opsional)</span>
                    </Label>
                    <Textarea
                      placeholder="Contoh: Depan warung Bu Sari, pagar besi warna hijau, dekat mushola"
                      rows={2}
                      disabled={isSubmitting}
                      className="border-gray-200 text-sm focus:border-blue-400 focus:ring-blue-100 resize-none"
                    />
                  </div>
                </div>
              )}

              {showAddressDetail && (
                <button
                  type="button"
                  onClick={() => setShowAddressDetail(false)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                  Tutup
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl bg-black text-white font-medium text-sm shadow-sm"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menyimpan...</>
              ) : (
                "Buat Order"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium text-sm"
            >
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}