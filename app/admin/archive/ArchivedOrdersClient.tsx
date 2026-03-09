"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { exportArchiveToExcel, deleteArchivedOrder } from "./server-action";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Order = {
    id: string;
    orderCode: string;
    orderDate: Date;
    serviceType: string;
    duration: string;
    workType: string;
    customerName: string;
    phone: string;
    address: string;
    createdAt: Date;
    archivedAt: Date;
    user?: { name: string | null; email: string };
};

export default function ArchivedOrdersClient({ orders }: { orders: Order[] }) {
    const [downloading, setDownloading] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [localOrders, setLocalOrders] = useState(orders);

    // Kelompokkan berdasarkan tahun-bulan (format: "YYYY-MM")
    const grouped = useMemo(() => {
        const groups: Record<string, { monthName: string; orders: Order[] }> = {};

        localOrders.forEach((order) => {
            const date = new Date(order.archivedAt);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const monthName = date.toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
            });

            if (!groups[yearMonth]) {
                groups[yearMonth] = { monthName, orders: [] };
            }
            groups[yearMonth].orders.push(order);
        });

        return groups;
    }, [localOrders]);

    const sortedYearMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const result = await exportArchiveToExcel();
            const binaryStr = atob(result.base64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Gagal download: " + (error instanceof Error ? error.message : "Terjadi kesalahan"));
        } finally {
            setDownloading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedOrderId) return;
        setDeletingId(selectedOrderId);
        setOpenDelete(false);
        try {
            await deleteArchivedOrder(selectedOrderId);
            // Hapus dari state lokal
            setLocalOrders((prev) => prev.filter((o) => o.id !== selectedOrderId));
        } catch (error) {
            alert("Gagal menghapus: " + (error instanceof Error ? error.message : "Terjadi kesalahan"));
        } finally {
            setDeletingId(null);
            setSelectedOrderId(null);
        }
    };

    if (sortedYearMonths.length === 0) {
        return <p className="text-muted-foreground text-center py-12">Belum ada arsip.</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">List Archive</h2>
                <Button onClick={handleDownload} disabled={downloading} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {downloading ? "Menyiapkan..." : "Download Excel"}
                </Button>
            </div>

            {sortedYearMonths.map((yearMonth) => {
                const { monthName, orders: monthOrders } = grouped[yearMonth];
                return (
                    <div key={yearMonth} className="border rounded-lg bg-white p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-semibold">{monthName}</h2>
                            <span className="text-sm text-muted-foreground">Total: {monthOrders.length} order</span>
                        </div>
                        <div className="space-y-3">
                            {monthOrders.map((order) => (
                                <div key={order.id} className="p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition relative group">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium">{order.orderCode} - {order.customerName}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(order.archivedAt).toLocaleDateString("id-ID")}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Layanan: {order.serviceType} - {order.workType} ({order.duration})
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">Telepon: {order.phone}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="px-6 h-8 w-8 text-red-500 hover:text-white hover:bg-red-500"
                                            onClick={() => {
                                                setSelectedOrderId(order.id);
                                                setOpenDelete(true);
                                            }}
                                            disabled={deletingId === order.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Dialog konfirmasi hapus */}
            <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus order ini? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Ya, Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}