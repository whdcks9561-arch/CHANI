"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onResult: (text: string) => void;
};

export default function Camera({ onResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(false);

  // 카메라 시작
  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }

    startCamera();
  }, []);

  // 사진 촬영 + 분석 요청
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    console.log("📸 capturePhoto 실행됨");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/png");

    try {
      setLoading(true);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await res.json();
      onResult(data.result);
    } catch (e) {
      alert("분석 중 오류가 발생했습니다.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="rounded-2xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-[320px] h-auto"
        />
      </div>

      <button
        onClick={capturePhoto}
        disabled={loading}
        className="bg-blue-600 px-6 py-3 rounded-full text-white text-lg disabled:opacity-50"
      >
        {loading ? "분석 중..." : "📸 사진 촬영"}
      </button>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
