"use client";

import { useRef, useState, useEffect } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // 📸 카메라 시작 (사용자 클릭 이후)
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
    } catch (error) {
      console.error("카메라 접근 오류:", error);
      alert("카메라 접근이 차단되었습니다.\n브라우저 권한 설정을 확인해주세요.");
    }
  };

  // 🧯 언마운트 시 카메라 종료
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // 📷 사진 캡처
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    // 👉 여기서 imageData를 관상 분석 API로 전달
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {!isCameraOn && (
        <button
          onClick={startCamera}
          className="px-6 py-3 bg-amber-500 text-black font-bold rounded-full"
        >
          📸 촬영 시작
        </button>
      )}

      <div className="w-full max-w-md aspect-[3/4] bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {isCameraOn && (
        <button
          onClick={capturePhoto}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full"
        >
          📷 사진 촬영
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
