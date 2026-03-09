import { notFound } from "next/navigation";
import {
  Calendar,
  User,
  Package,
  Clock,
  Wrench,
  CreditCard,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Home,
} from "lucide-react";

// Data placeholder untuk detail (biasanya fetch berdasarkan params.id)
const orderDetail = {
  id: "ORD-001",
  date: "2025-02-10 • 14:30",
  serviceType: "Laundry Kiloan",
  duration: "3 hari",
  workType: "Cuci + Setrika",
  paymentMethod: "Transfer Bank",
  total: "Rp 45.000",
  customer: {
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "081234567890",
    address: "Jl. Merdeka No. 45, Jakarta",
  },
  location: {
    lat: -6.2088,
    lng: 106.8456,
    address: "Jl. Merdeka No. 45, Jakarta",
  },
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  // Simulasi fetch data berdasarkan id
  const order = orderDetail; // nanti diganti dengan data dinamis

  if (!order) return notFound();

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <a href="/admin" className="hover:underline">Daftar Order</a>
        <span>/</span>
        <span className="text-gray-700">{order.id}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-800">🔍 Detail Order #{order.id}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri + Tengah (Informasi Order & Customer) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Informasi Order */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Informasi Order
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem icon={Calendar} label="Tanggal Order" value={order.date} />
              <InfoItem icon={Package} label="Jenis Layanan" value={order.serviceType} />
              <InfoItem icon={Clock} label="Durasi Layanan" value={order.duration} />
              <InfoItem icon={Wrench} label="Jenis Pengerjaan" value={order.workType} />
              <InfoItem icon={CreditCard} label="Metode Pembayaran" value={order.paymentMethod} />
              <InfoItem icon={DollarSign} label="Total Harga" value={order.total} valueClassName="text-green-600 font-bold" />
            </div>
          </div>

          {/* Card Data Customer */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Data Customer
            </h2>
            <div className="space-y-3">
              <InfoItem icon={User} label="Nama" value={order.customer.name} />
              <InfoItem icon={Mail} label="Email" value={order.customer.email} />
              <InfoItem icon={Phone} label="No. Telepon" value={order.customer.phone} />
              <InfoItem icon={Home} label="Alamat" value={order.customer.address} />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Lokasi Maps */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Titik Lokasi
            </h2>
            <p className="text-sm text-gray-600">{order.location.address}</p>
            {/* Placeholder Peta (tanpa API key) */}
            <div className="w-full h-48 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500">
              <MapPin className="w-12 h-12 mb-2" />
              <span className="text-sm">Peta Lokasi</span>
              <span className="text-xs text-gray-400 mt-1">
                ({order.location.lat}, {order.location.lng})
              </span>
            </div>
            <p className="text-xs text-gray-400">
              * Integrasi Google Maps dapat ditambahkan kemudian
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen pembantu untuk menampilkan item informasi
function InfoItem({ icon: Icon, label, value, valueClassName = "" }: any) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-medium ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}