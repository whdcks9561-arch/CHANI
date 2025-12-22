
export interface FacialTraits {
  eye: string;
  nose: string;
  mouth: string;
  skin: string;
  faceShape: string;
  moles: string;
}

export interface CelebrityMatch {
  name: string;
  similarity: number;
  reason: string;
}

export interface AnimalMatch {
  type: string;
  reason: string;
}

export interface GwansangResult {
  summary: string;
  traits: FacialTraits;
  fortune: string;
  relationshipLuck: string;
  spouseLuck: string;
  caution: string;
  lottoLuck: string;
  luckyNumbers: number[];
  celebrities: CelebrityMatch[];
  animal: AnimalMatch;
  overallRating: number;
}

export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}
