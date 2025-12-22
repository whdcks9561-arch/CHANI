
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraProps {
  onCapture: (base64: string) => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 720 },
            height: { ideal: 1280 }
          }
        };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("카메라 권한이 필요합니다. 설정에서 카메라 접근을 허용해주세요.");
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        // 모바일 비율에 맞춰 캔버스 크기 설정
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // 거울 모드 대응 (전면 카메라일 경우 반전 필요하면 여기서 처리 가능)
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(base64);
      }
    }
  }, [onCapture]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-amber-400/30">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]" // 전면 카메라 거울 효과
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 border-[20px] border-slate-950/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[70%] border-2 border-dashed border-amber-400/60 rounded-[100px] shadow-[0_0_50px_rgba(251,191,36,0.2)]" />
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <button
          onClick={capture}
          className="group relative w-20 h-20 flex items-center justify-center active:scale-90 transition-transform"
        >
          <div className="absolute inset-0 bg-white/20 rounded-full animate-ping group-active:hidden" />
          <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center shadow-2xl">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-full" />
          </div>
        </button>
      </div>
      
      <div className="absolute top-6 left-0 right-0 text-center">
        <span className="px-4 py-1.5 bg-slate-950/60 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-widest border border-white/20">
          얼굴을 중앙에 맞춰주세요
        </span>
      </div>
    </div>
  );
};

export default Camera;
