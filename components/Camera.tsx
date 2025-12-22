"use client";

import { useRef, useState, useEffect } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<string>("");

  // 카메라 시작
  const startCamera = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      await videoRef.current.play();
    }

    setStream(mediaStream);
  };

  // 사진 촬영 + 분석 요청
  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/png");

    console.log("📸 캡처 완료");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });

    const data = await res.json();
    setResult(data.result);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <video
        ref={videoRef}
        playsInline
        muted
        className="rounded-xl w-full max-w-sm"
      />
      <button
        onClick={captureAndAnalyze}
        className="px-6 py-3 bg-blue-600 text-white rounded-full"
      >
        📷 사진 촬영
      </button>

      {result && (
        <div className="bg-white text-black p-4 rounded-xl whitespace-pre-line">
          {result}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
