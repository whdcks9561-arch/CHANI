"use client";

import { useRef, useState, useEffect } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 카메라 시작
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStream(mediaStream);
    } catch (err) {
      console.error("카메라 접근 실패", err);
      setError("카메라를 사용할 수 없습니다.");
    }
  };

  // 사진 촬영 + 서버 전송
const captureAndAnalyze = async () => {
  if (!videoRef.current || !canvasRef.current) return;

  setLoading(true);
  setError("");
  setResult("");

  try {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    // canvas → Blob
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    if (!blob) {
      throw new Error("이미지 생성 실패");
    }

    // ✅ FormData 생성
    const formData = new FormData();
    formData.append("image", blob, "capture.png");

    // ❗ Content-Type 헤더 직접 지정 ❌ (브라우저가 자동 설정)
    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`서버 오류 (${res.status})`);
    }

    const data = await res.json();
    setResult(data.result ?? "결과가 없습니다.");
  } catch (err) {
    console.error(err);
    setError("분석 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <video
        ref={videoRef}
        playsInline
        muted
        className="rounded-xl w-full max-w-sm bg-black"
      />

      <button
        onClick={captureAndAnalyze}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-full disabled:opacity-50"
      >
        {loading ? "분석 중..." : "📷 사진 촬영"}
      </button>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white text-black p-4 rounded-xl whitespace-pre-line max-w-sm">
          {result}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
