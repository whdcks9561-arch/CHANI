
import React, { useState } from 'react';
import { GwansangResult } from '../types';

interface ResultViewProps {
  result: GwansangResult;
  image: string | null;
  onReset: () => void;
}

const getAnimalEmoji = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('강아지') || t.includes('개')) return '🐶';
  if (t.includes('고양이')) return '🐱';
  if (t.includes('곰')) return '🐻';
  if (t.includes('다람쥐')) return '🐿️';
  if (t.includes('늑대')) return '🐺';
  if (t.includes('여우')) return '🦊';
  if (t.includes('토끼')) return '🐰';
  if (t.includes('사자')) return '🦁';
  if (t.includes('호랑이')) return '🐯';
  return '🐾';
};

const ResultView: React.FC<ResultViewProps> = ({ result, image, onReset }) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleShare = async () => {
    try {
      // 이미지 제외한 결과 데이터만 인코딩 (URL 길이 제한 때문)
      const shareObj = { ...result };
      const encodedData = btoa(encodeURIComponent(JSON.stringify(shareObj)));
      const shareUrl = `${window.location.origin}${window.location.pathname}?res=${encodedData}`;

      const shareData = {
        title: '차니 관상 분석 결과',
        text: `[차니 관상] 나의 관상 복 점수는 ${result.overallRating}점!\n총평: "${result.summary}"\n동물상: ${result.animal.type}상\n\n지금 바로 확인해보세요!`,
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      }
    } catch (err) {
      console.error('Sharing failed', err);
      alert('공유 링크 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      <div className="text-center space-y-2">
        <h2 className="text-4xl md:text-5xl font-mystic text-amber-400">분석 결과</h2>
        <p className="text-slate-400 text-sm">차니 관상이 읽어낸 당신의 운명</p>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-900/60 p-6 rounded-[2rem] border border-amber-400/20 shadow-2xl backdrop-blur-xl">
        <div className="w-40 md:w-48 h-56 md:h-64 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400/30 shadow-lg bg-slate-800 flex items-center justify-center">
          {image ? (
            <img src={`data:image/jpeg;base64,${image}`} className="w-full h-full object-cover scale-x-[-1]" alt="Captured Face" />
          ) : (
            <div className="text-center p-4">
              <span className="text-5xl block mb-2">🔮</span>
              <span className="text-[10px] text-amber-400/60 font-bold uppercase tracking-tighter">Shared Result</span>
            </div>
          )}
        </div>
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold text-sm md:text-lg">종합 복(福) 점수</span>
            <span className="text-3xl md:text-4xl font-mystic text-white">{result.overallRating}점</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${result.overallRating > 70 ? 'bg-gradient-to-r from-amber-600 to-amber-300' : 'bg-gradient-to-r from-slate-600 to-slate-400'}`} 
              style={{ width: `${result.overallRating}%` }} 
            />
          </div>
          <p className="text-base md:text-lg leading-relaxed text-slate-200 italic font-medium">
            "{result.summary}"
          </p>
        </div>
      </div>

      {/* Lotto Section */}
      <div className="bg-gradient-to-br from-emerald-900/40 to-green-900/20 p-6 rounded-[2rem] border border-emerald-500/30 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💸</div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-xl md:text-2xl font-mystic text-emerald-400">횡재수와 로또운</h3>
        </div>
        <p className="text-sm md:text-base text-slate-200 mb-6 leading-relaxed">
          {result.lottoLuck}
        </p>
        <div className="space-y-4">
          <p className="text-xs text-emerald-300/80 font-bold tracking-widest uppercase">Lucky Numbers</p>
          <div className="flex flex-wrap justify-center gap-3">
            {result.luckyNumbers.map((num, idx) => (
              <div 
                key={idx} 
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-emerald-500 text-slate-950 font-black rounded-full shadow-lg border-2 border-emerald-300 text-lg"
              >
                {num}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2 text-sm md:text-base">
            <span className="text-xl">👁️</span> 부위별 특징
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex flex-col gap-1"><span className="font-bold text-white text-xs text-amber-500/80">눈</span> {result.traits.eye}</li>
            <li className="flex flex-col gap-1"><span className="font-bold text-white text-xs text-amber-500/80">코</span> {result.traits.nose}</li>
            <li className="flex flex-col gap-1"><span className="font-bold text-white text-xs text-amber-500/80">입</span> {result.traits.mouth}</li>
            <li className="flex flex-col gap-1"><span className="font-bold text-white text-xs text-amber-500/80">얼굴형</span> {result.traits.faceShape}</li>
            <li className="flex flex-col gap-1"><span className="font-bold text-white text-xs text-amber-500/80">점(Moles)</span> {result.traits.moles}</li>
          </ul>
        </div>
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2 text-sm md:text-base">
            <span className="text-xl">✨</span> 미래 운세 요약
          </h3>
          <p className="text-sm leading-relaxed text-slate-300">{result.fortune}</p>
        </div>
      </div>

      {/* Love/Spouse & Caution */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-950/30 p-5 rounded-2xl border border-rose-500/30">
            <h3 className="text-rose-400 font-bold mb-3 flex items-center gap-2 text-sm md:text-base">
              <span className="text-xl">❤️</span> 연애운
            </h3>
            <p className="text-sm leading-relaxed text-slate-200">{result.relationshipLuck}</p>
          </div>
          <div className="bg-indigo-950/30 p-5 rounded-2xl border border-indigo-500/30">
            <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2 text-sm md:text-base">
              <span className="text-xl">💍</span> 배우자운
            </h3>
            <p className="text-sm leading-relaxed text-slate-200">{result.spouseLuck}</p>
          </div>
        </div>

        <div className="bg-orange-950/40 p-6 rounded-2xl border border-orange-500/30">
          <h3 className="text-orange-400 font-bold mb-3 flex items-center gap-2 text-sm md:text-base">
            <span className="text-xl">⚠️</span> 조심해야 할 점
          </h3>
          <p className="text-sm leading-relaxed text-orange-50 font-medium">
            {result.caution}
          </p>
        </div>
      </div>

      {/* Animal Likeness */}
      <div className="bg-gradient-to-r from-amber-900/30 to-indigo-900/30 p-8 rounded-[2.5rem] border border-amber-400/20 text-center space-y-4 shadow-xl">
        <h3 className="text-xl md:text-2xl font-mystic text-amber-400">당신은 어떤 동물상?</h3>
        <div className="text-7xl md:text-8xl py-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]">
          {getAnimalEmoji(result.animal.type)}
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          "{result.animal.type}상"
        </div>
        <p className="text-sm md:text-base text-slate-300 max-w-sm mx-auto leading-relaxed">
          {result.animal.reason}
        </p>
      </div>

      {/* Celebrities */}
      <div className="space-y-6">
        <h3 className="text-2xl font-mystic text-amber-400 text-center">닮은꼴 연예인</h3>
        <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto pb-4 md:pb-0 px-2 snap-x">
          {result.celebrities.map((celeb, idx) => (
            <div key={idx} className="min-w-[80%] md:min-w-0 snap-center bg-slate-900/60 p-6 rounded-[2rem] border border-white/10 text-center space-y-3 backdrop-blur-sm">
              <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center text-3xl">🎭</div>
              <h4 className="text-xl font-bold text-white">{celeb.name}</h4>
              <div className="inline-block px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-bold">
                {celeb.similarity}% 일치
              </div>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{celeb.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons Container */}
      <div className="fixed bottom-6 left-4 right-4 z-50 md:relative md:bottom-0 md:left-0 md:right-0 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 text-lg uppercase tracking-tighter"
        >
          {image ? '다시 분석하기' : '나도 관상 보기'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all active:scale-95 text-lg flex items-center justify-center gap-2"
        >
          <span>{copyFeedback ? '✅ 링크 복사됨!' : '📤 결과 공유하기'}</span>
        </button>
      </div>
    </div>
  );
};

export default ResultView;
