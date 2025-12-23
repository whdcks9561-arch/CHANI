"use client";

import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // 카메라 시작
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("카메라 접근 실패:", err);
      }
    }

    startCamera();
  }, []);

  // 사진 촬영 + 리사이즈 + API 전송
  const captureImage = async () => {
    if (!videoRef.current) return;

    setLoading(true);
    setResult("");

    const video = videoRef.current;

    // ✅ Gemini 500 방지용 리사이즈
    const MAX_WIDTH = 640;
    const scale = MAX_WIDTH / video.videoWidth;

    const canvas = document.createElement("canvas");
    canvas.width = MAX_WIDTH;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setLoading(false);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // ✅ JPEG + 압축 (중요)
    const imageData = canvas.toDataURL("image/jpeg", 0.8);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageData }),
      });

      if (!res.ok) {
        throw new Error(`API 오류: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.result || "분석 결과가 없습니다.");
    } catch (err: any) {
      console.error("분석 실패:", err);
      setResult("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        padding: 16,
        textAlign: "center",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          borderRadius: 12,
          background: "#000",
        }}
      />

      <button
        onClick={captureImage}
        disabled={loading}
        style={{
          marginTop: 12,
          padding: "12px 20px",
          fontSize: 16,
          borderRadius: 999,
          border: "none",
          background: loading ? "#888" : "#2563eb",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "분석 중..." : "사진 촬영"}
      </button>

      {result && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#f1f5f9",
            borderRadius: 8,
            whiteSpace: "pre-wrap",
            textAlign: "left",
            fontSize: 14,
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
