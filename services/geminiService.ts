
import { GoogleGenAI, Type } from "@google/genai";
import { GwansangResult } from "../types";

export const analyzeFace = async (imageBase64: string): Promise<GwansangResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    이미지 속의 얼굴을 분석하여 한국의 전통 '관상(Gwansang)' 분석을 수행해주세요.
    단순히 좋은 말만 하지 말고, 관상학적 단점과 주의사항을 포함하여 정직하게 분석하세요.
    
    분석 항목:
    1. 전반적인 관상 총평 (summary)
    2. 부위별 특징 (눈, 코, 입, 피부, 얼굴형, 점의 위치와 의미)
    3. 미래 운세 (fortune)
    4. 연애운 및 배우자운 (relationshipLuck, spouseLuck)
    5. 조심해야 할 점 (caution) - 위험 요소 및 살(煞)
    6. **로또운 (lottoLuck)** - 횡재수, 재물 기운, 로또 당첨운을 분석하여 설명해주세요.
    7. **행운의 번호 (luckyNumbers)** - 관상에서 느껴지는 기운과 연관된 1~45 사이의 행운의 번호 6개를 추천해주세요.
    8. 닮은꼴 동물 (animal) - 강아지, 곰, 고양이, 다람쥐, 늑대 중 우선 고려
    9. 닮은꼴 연예인 (celebrities)
    10. 종합 복 점수 (overallRating)

    반드시 다음 JSON 형식을 지켜주세요. 답변은 한국어로 작성해주세요.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          traits: {
            type: Type.OBJECT,
            properties: {
              eye: { type: Type.STRING },
              nose: { type: Type.STRING },
              mouth: { type: Type.STRING },
              skin: { type: Type.STRING },
              faceShape: { type: Type.STRING },
              moles: { type: Type.STRING },
            },
            required: ["eye", "nose", "mouth", "skin", "faceShape", "moles"]
          },
          fortune: { type: Type.STRING },
          relationshipLuck: { type: Type.STRING },
          spouseLuck: { type: Type.STRING },
          caution: { type: Type.STRING },
          lottoLuck: { type: Type.STRING, description: "횡재수 및 로또운 분석" },
          luckyNumbers: { 
            type: Type.ARRAY, 
            items: { type: Type.INTEGER },
            description: "1~45 사이의 행운의 번호 6개"
          },
          animal: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["type", "reason"]
          },
          celebrities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                similarity: { type: Type.NUMBER },
                reason: { type: Type.STRING }
              },
              required: ["name", "similarity", "reason"]
            }
          },
          overallRating: { type: Type.NUMBER }
        },
        required: [
          "summary", "traits", "fortune", "relationshipLuck", "spouseLuck", 
          "caution", "lottoLuck", "luckyNumbers", "animal", "celebrities", "overallRating"
        ]
      }
    },
  });

  const resultText = response.text;
  if (!resultText) throw new Error("분석 결과를 받지 못했습니다.");
  
  return JSON.parse(resultText) as GwansangResult;
};
