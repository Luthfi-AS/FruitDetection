"use client";

export interface CartItem {
  id: string;
  name: string;
  pricePerKg: number;
  weight: number;
}

interface ReceiptPanelProps {
  cart: CartItem[];
  onUpdateWeight: (id: string, weight: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export default function ReceiptPanel({
  cart,
  onUpdateWeight,
  onRemoveItem,
  onClearCart,
}: ReceiptPanelProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const grandTotal = cart.reduce(
    (acc, curr) => acc + curr.pricePerKg * curr.weight,
    0,
  );

  return (
    <div className="receipt-panel">
      {cart.length === 0 ? (
        <div
          className="product-card empty"
          style={{ minHeight: "240px", flexDirection: "column", gap: "12px" }}
        >
          <div
            className="scan-prompt"
            style={{ flexDirection: "column", textAlign: "center", gap: "8px" }}
          >
            <span className="scan-icon" style={{ fontSize: "28px" }}>
              ⎙
            </span>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--ink-primary)",
              }}
            >
              KERANJANG KOSONG
            </span>
            <span style={{ fontSize: "13px", color: "var(--ink-disabled)" }}>
              Hadapkan 1 produk ke kamera lalu tekan tombol scan.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1" style={{ gap: "24px" }}>
          <div className="flex flex-col gap-4">
            <div
              className="flex justify-between items-center"
              style={{
                borderBottom: "1px solid var(--hairline-border)",
                paddingBottom: "12px",
              }}
            >
              <span className="section-label" style={{ marginBottom: 0 }}>
                DAFTAR BARANG TIMBANGAN
              </span>
              <button onClick={onClearCart} className="reset-btn">
                Clear All
              </button>
            </div>

            <div
              className="flex flex-col gap-3"
              style={{
                maxHeight: "340px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="product-card detected"
                  style={{
                    padding: "12px 16px",
                    gap: "12px",
                    minHeight: "72px",
                  }}
                >
                  <div
                    className="flex flex-col flex-1 min-w-0"
                    style={{ gap: "2px" }}
                  >
                    <span
                      className="product-name truncate"
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="product-price-per-kg"
                      style={{ fontSize: "13px", color: "var(--ink-muted)" }}
                    >
                      {formatRupiah(item.pricePerKg)}
                      <span
                        className="per-kg"
                        style={{
                          fontSize: "11px",
                          color: "var(--ink-disabled)",
                        }}
                      >
                        {" "}
                        / kg
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="weight-control" style={{ padding: "2px" }}>
                      <button
                        className="weight-btn"
                        style={{
                          width: "28px",
                          height: "28px",
                          fontSize: "14px",
                        }}
                        onClick={() =>
                          onUpdateWeight(
                            item.id,
                            Math.max(0.05, item.weight - 0.05),
                          )
                        }
                      >
                        −
                      </button>
                      <input
                        type="number"
                        step="0.05"
                        min="0.05"
                        value={item.weight}
                        onChange={(e) =>
                          onUpdateWeight(
                            item.id,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="weight-input"
                        style={{
                          width: "48px",
                          height: "28px",
                          fontSize: "14px",
                        }}
                      />
                      <button
                        className="weight-btn"
                        style={{
                          width: "28px",
                          height: "28px",
                          fontSize: "14px",
                        }}
                        onClick={() =>
                          onUpdateWeight(item.id, item.weight + 0.05)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      style={{
                        background: "none",
                        color: "#ff3b30",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 600,
                        padding: "0 4px",
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="mt-auto pt-6"
            style={{ borderTop: "1px solid var(--hairline-border)" }}
          >
            <h3 className="section-label" style={{ marginBottom: "16px" }}>
              NOTA PEMBAYARAN
            </h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "15px",
                color: "var(--ink-muted)",
              }}
            >
              <tbody>
                {cart.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px dashed var(--hairline-border)",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 0",
                        fontWeight: 500,
                        textTransform: "capitalize",
                      }}
                    >
                      {item.name} ({item.weight.toFixed(2)} kg)
                    </td>
                    <td
                      style={{
                        padding: "10px 0",
                        textAlign: "right",
                        fontWeight: 600,
                        color: "var(--ink-primary)",
                      }}
                    >
                      {formatRupiah(item.pricePerKg * item.weight)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              className="total-section flex justify-between items-baseline"
              style={{ marginTop: "24px", marginBottom: "20px" }}
            >
              <span className="total-label">TOTAL AKHIR</span>
              <span className="total-amount active">
                {formatRupiah(grandTotal)}
              </span>
            </div>

            <button className="checkout-btn ready">CHECKOUT</button>
          </div>
        </div>
      )}
    </div>
  );
}
