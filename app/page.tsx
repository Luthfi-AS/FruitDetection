"use client";

import { useState } from "react";
import CameraStream, { ItemDetection } from "./components/CameraStream";
import ReceiptPanel, { CartItem } from "./components/ReceiptPanel";

// 1. Fallback ke localhost untuk dev lokal, dan bersihkan garis miring di akhir string
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

// 2. Tambahkan route /api/detect secara eksplisit agar tembakan API tepat sasaran
const API_ENDPOINT = `${BASE_URL}/api/detect`;

export default function HomePage() {
  const [latestDetection, setLatestDetection] = useState<ItemDetection | null>(
    null,
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean>(true);

  // 3. Tambahkan state isDetecting untuk mencegah spam request dan memberikan feedback UI
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  const handleCaptureUpload = async (blob: Blob) => {
    // Cegah penumpukan request jika API belum selesai merespons
    if (isDetecting) return;

    setIsDetecting(true);
    const formData = new FormData();
    formData.append("file", blob, "capture.jpg");

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setApiOnline(true);

      if (data.success && data.detected) {
        const item: ItemDetection = data.detection;
        setLatestDetection(item);

        const newCartItem: CartItem = {
          // Gunakan substring yang lebih aman dari depreciated substr
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: item.name,
          pricePerKg: item.price,
          weight: 1.0,
        };
        setCart((prevCart) => [...prevCart, newCartItem]);
      } else {
        setLatestDetection(null);
        // Menggunakan console.warn atau notifikasi UI jauh lebih baik daripada alert()
        // karena alert() akan membekukan (freeze) browser saat deteksi gagal
        console.warn(
          "Produk tidak dikenali, coba atur posisi buah agar lebih jelas.",
        );
      }
    } catch (err) {
      console.error("Koneksi API bermasalah:", err);
      setApiOnline(false);
      setLatestDetection(null);
    } finally {
      // Selalu matikan loading state, baik saat sukses maupun gagal
      setIsDetecting(false);
    }
  };

  const handleUpdateWeight = (id: string, weight: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, weight } : item)),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    setLatestDetection(null);
  };

  return (
    <main className="app-shell">
      <header className="app-header" style={{ justifyContent: "center" }}>
        <div className="header-center">
          <h1 className="header-title">Kasir Mandiri Otomatis</h1>
          <p className="header-sub">
            Sistem Kasir Timbangan — Pindai Item Satu per Satu
          </p>
          {/* Indikator UI elegan jika server API mati atau sedang Cold Start */}
          {!apiOnline && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "0.875rem",
                marginTop: "8px",
                fontWeight: "500",
              }}
            >
              ⚠️ Menunggu server API merespons... (Mungkin butuh 1-2 menit jika
              server sleep)
            </div>
          )}
        </div>
      </header>

      <div className="workspace">
        <section className="panel camera-panel">
          <div className="panel-label">
            KAMERA SCANNER
            {/* Visual feedback bahwa gambar sedang diproses */}
            {isDetecting && (
              <span style={{ marginLeft: "8px", color: "#3b82f6" }}>
                Mendeteksi...
              </span>
            )}
          </div>
          <CameraStream
            latestDetection={latestDetection}
            onCapture={handleCaptureUpload}
          />
        </section>

        <section className="panel receipt-section">
          <ReceiptPanel
            cart={cart}
            onUpdateWeight={handleUpdateWeight}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
          />
        </section>
      </div>
    </main>
  );
}
