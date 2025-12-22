"use client";

import { useRef, useState, useEffect } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 📸 카메라 시작
  const startCamera = async () => {
    if (isCameraOn) return;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setIsCameraOn(true);
      setResult(null);
    } catch (e) {
      alert("카메라 권한을 허용해주세요.");
    }
  };

  // 🧯 종료 시 카메라 끄기
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // 📷 사진 촬영 + 분석
  const capturePhoto = async () => {
    console.log("📸 캡처 실행");

    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL("image/png");

    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();
      setResult(data.result ?? "분석 결과 없음");
    } catch {
      setResult("관상 분석 실패");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4">
      {/* 카메라 화면 */}
      <div
        className="w-full aspect-[3/4] bg-black rounded-xl overflow-hidden"
        onClick={!isCameraOn ? startCamera : undefined}
      >
<video
  ref={videoRef}
  autoPlay
  playsInline
  className="w-full h-full object-cover pointer-events-none"
/>

      </div>

      {/* 버튼 */}
      {!isCameraOn ? (
        <button
          type="button"
          onClick={startCamera}
          className="z-10 px-6 py-3 bg-amber-500 text-black font-bold rounded-full"
        >
          📸 촬영 시작
        </button>
      ) : (
        <button
          type="button"
          onClick={capturePhoto}
          className="z-10 px-6 py-3 bg-blue-600 text-white font-bold rounded-full"
        >
          📷 사진 촬영
        </button>
      )}

      {/* 상태 */}
      {isAnalyzing && (
        <p className="text-sm text-slate-400">🔮 관상 분석 중...</p>
      )}

      {result && (
        <div className="mt-4 p-4 bg-slate-800 rounded-xl text-sm whitespace-pre-line">
          {result}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
