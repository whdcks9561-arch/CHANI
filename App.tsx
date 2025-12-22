
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, GwansangResult } from './types';
import Camera from './components/Camera';
import ResultView from './components/ResultView';
import { analyzeFace } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<GwansangResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 공유된 결과 복원 로직
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedResult = params.get('res');
    if (sharedResult) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedResult)));
        setResult(decoded);
        setState(AppState.RESULT);
        setCapturedImage(null); // 공유된 데이터에는 이미지가 없음
      } catch (err) {
        console.error("Failed to restore shared result", err);
      }
    }
  }, []);

  const handleCapture = useCallback(async (base64: string) => {
    setCapturedImage(base64);
    setState(AppState.ANALYZING);
    setError(null);

    try {
      const analysis = await analyzeFace(base64);
      setResult(analysis);
      setState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setError("얼굴 분석 중 오류가 발생했습니다. 조명이 밝은 곳에서 다시 시도해 주세요.");
      setState(AppState.ERROR);
    }
  }, []);

  const reset = () => {
    // URL 파라미터 제거
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    setState(AppState.IDLE);
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-amber-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[40%] bg-indigo-900/30 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center px-4">
        {state === AppState.IDLE && (
          <div className="w-full text-center space-y-12 py-16 md:py-24 animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-mystic text-amber-400 drop-shadow-[0_5px_15px_rgba(251,191,36,0.3)]">
                차니 관상
              </h1>
              <p className="text-sm md:text-lg text-slate-400 font-light tracking-[0.3em] uppercase">
                Ancient Fate Meets Future AI
              </p>
            </div>
            
            <div className="bg-slate-900/40 p-8 md:p-12 rounded-[2.5rem] border border-white/5 backdrop-blur-xl max-w-md mx-auto shadow-2xl">
              <div className="text-7xl mb-8 animate-pulse">🔮</div>
              <p className="text-slate-300 leading-relaxed mb-10 text-sm md:text-base">
                당신의 얼굴에 새겨진 기운과 운명을 분석합니다.<br/>
                관상, 재물운, 연애운부터 닮은꼴 동물과 연예인까지<br/>
                신비로운 AI 마스터의 조언을 들어보세요.
              </p>
              <button
                onClick={() => setState(AppState.CAPTURING)}
                className="w-full py-5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl shadow-[0_15px_30px_rgba(245,158,11,0.2)] transition-all active:scale-95 text-xl tracking-tight"
              >
                관상 보기 시작
              </button>
            </div>
          </div>
        )}

        {state === AppState.CAPTURING && (
          <div className="w-full py-8 animate-in fade-in duration-500">
            <div className="flex justify-start mb-6">
              <button 
                onClick={reset} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 text-xs font-bold transition-colors border border-white/10"
              >
                ← 처음으로
              </button>
            </div>
            <Camera onCapture={handleCapture} />
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center space-y-10 py-32">
            <div className="relative">
              <div className="w-40 h-40 border-[6px] border-amber-400/10 border-t-amber-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">🪬</div>
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-mystic text-amber-400 animate-pulse">운명의 기운을 읽는 중</h2>
              <p className="text-slate-400 text-sm tracking-widest">AI가 당신의 오관(五官)을 정밀 분석하고 있습니다.</p>
            </div>
          </div>
        )}

        {state === AppState.RESULT && result && (
          <ResultView result={result} image={capturedImage} onReset={reset} />
        )}

        {state === AppState.ERROR && (
          <div className="w-full max-w-md mx-auto text-center space-y-8 bg-red-950/20 p-12 rounded-[2.5rem] border border-red-500/20 backdrop-blur-md mt-20">
            <div className="text-7xl">🏮</div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-red-400">분석에 실패했습니다</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
            </div>
            <button
              onClick={reset}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
            >
              다시 시도하기
            </button>
          </div>
        )}
      </main>

      <footer className="mt-auto py-10 text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase">
        © 2024 Chani Gwansang Master. All Rights Reserved.
      </footer>
    </div>
  );
};

export default App;
