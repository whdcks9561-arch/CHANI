"use client";

import { useRef, useState, useEffect } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  /* =========================
     📸 카메라 시작
     ========================= */
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert("이 브라우저에서는 카메라를 사용할 수 없습니다.");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true; // iOS 필수
        await videoRef.current.play();
      }

      setStream(mediaStream);
      setIsCameraOn(true);
      setResult(null);
    } catch (error) {
      console.error("카메라 접근 오류:", error);
      alert("카메라 권한을 허용해주세요.");
    }
  };

  /* =========================
     🧯 언마운트 시 카메라 종료
     ========================= */
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  /* =========================
     📷 사진 촬영 + 관상 분석
     ========================= */
  const capturePhoto = async () => {
    console.log("📸 촬영 버튼 클릭됨");

    if (!videoRef.current || !canvasRef.current) {
      console.warn("video 또는 canvas 없음");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("canvas context 없음");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
      setResult(data.result || "분석 결과가 없습니다.");
    } catch (err) {
      console.error(err);
      setResult("관상 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4">
      {!isCameraOn && (
        <button
          type="button"
          onClick={startCamera}
          className="relative z-10 px-6 py-3 bg-amber-500 text-black font-bold rounded-full"
        >
          📸 촬영 시작
        </button>
      )}

      <div className="w-full aspect-[3/4] bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {isCameraOn && (
        <button
          type="button"
          onClick={() => {
            alert("사진 촬영 버튼 클릭됨");
            capturePhoto();
          }}
          className="relative z-10 px-6 py-3 bg-blue-600 text-white font-bold rounded-full"
        >
          📷 사진 촬영
        </button>
      )}

      {isAnalyzing && (
        <p className="text-sm text-slate-400">🔮 관상 분석 중입니다...</p>
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
