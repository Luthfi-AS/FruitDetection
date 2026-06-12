"use client";

import { useEffect, useRef, useState } from "react";

export interface ItemDetection {
  name: string;
  price: number;
  box: [number, number, number, number];
}

interface CameraStreamProps {
  latestDetection: ItemDetection | null;
  onCapture: (blob: Blob) => Promise<void>;
}

const CAPTURE_SIZE = 640;
const FRAME_QUALITY = 0.85;

export default function CameraStream({
  latestDetection,
  onCapture,
}: CameraStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const latestDetectionRef = useRef<ItemDetection | null>(latestDetection);

  useEffect(() => {
    latestDetectionRef.current = latestDetection;
  }, [latestDetection]);

  useEffect(() => {
    let isMounted = true;
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: CAPTURE_SIZE },
            height: { ideal: CAPTURE_SIZE },
            aspectRatio: 1.0,
          },
          audio: false,
        });

        if (!isMounted) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        stream = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scheduleFrame();
        }
      } catch (err) {
        console.error("Gagal memuat kamera:", err);
      }
    }

    function scheduleFrame() {
      if (!isMounted) return;
      rafRef.current = requestAnimationFrame(processFrame);
    }

    function processFrame() {
      const video = videoRef.current;
      const visible = visibleCanvasRef.current;

      if (!video || !visible || video.readyState < 2) {
        scheduleFrame();
        return;
      }

      const vCtx = visible.getContext("2d");
      if (!vCtx) {
        scheduleFrame();
        return;
      }

      vCtx.drawImage(video, 0, 0, visible.width, visible.height);

      const currentDetection = latestDetectionRef.current;
      if (currentDetection) {
        const [x1, y1, x2, y2] = currentDetection.box;
        const scaleX = visible.width / CAPTURE_SIZE;
        const scaleY = visible.height / CAPTURE_SIZE;

        vCtx.save();
        vCtx.strokeStyle = "#0066cc";
        vCtx.lineWidth = 3;
        vCtx.strokeRect(
          x1 * scaleX,
          y1 * scaleY,
          (x2 - x1) * scaleX,
          (y2 - y1) * scaleY,
        );

        const label = `${currentDetection.name}`;
        vCtx.font = "600 12px 'Poppins', sans-serif";
        const textW = vCtx.measureText(label).width;
        vCtx.fillStyle = "#0066cc";
        vCtx.fillRect(x1 * scaleX, y1 * scaleY - 22, textW + 10, 22);
        vCtx.fillStyle = "#ffffff";
        vCtx.fillText(label, x1 * scaleX + 5, y1 * scaleY - 6);
        vCtx.restore();
      }

      scheduleFrame();
    }

    startCamera();

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafRef.current);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCaptureClick = () => {
    const video = videoRef.current;
    const hidden = hiddenCanvasRef.current;
    if (!video || !hidden || loading) return;

    const hCtx = hidden.getContext("2d");
    if (!hCtx) return;

    hCtx.drawImage(video, 0, 0, CAPTURE_SIZE, CAPTURE_SIZE);
    setLoading(true);

    hidden.toBlob(
      async (blob) => {
        if (blob) {
          await onCapture(blob);
        }
        setLoading(false);
      },
      "image/jpeg",
      FRAME_QUALITY,
    );
  };

  return (
    <div
      className="camera-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        alignItems: "center",
      }}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <canvas
        ref={hiddenCanvasRef}
        width={CAPTURE_SIZE}
        height={CAPTURE_SIZE}
        style={{ display: "none" }}
      />

      <div className="canvas-container" style={{ width: "100%" }}>
        <canvas
          ref={visibleCanvasRef}
          width={640}
          height={640}
          className="visible-canvas"
        />
      </div>

      <button
        onClick={handleCaptureClick}
        disabled={loading}
        className={`checkout-btn ${loading ? "disabled" : "ready"}`}
        style={{ maxWidth: "640px", padding: "12px 32px", marginBottom: "12px", marginTop: "-12px" }}
      >
        {loading ? "MENILAI AKURASI..." : "SCAN 1 ITEM BELANJAAN"}
      </button>
    </div>
  );
}
