import { GoogleGenerativeAI } from "@google/genai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY!
);

export async function analyzeFace(base64Image: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const imagePart = {
    inlineData: {
      data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
      mimeType: "image/png",
    },
  };

  const prompt = `
이 사진을 보고 관상 관점에서 분석해줘.
과학적 사실이 아니라 재미와 참고용이라는 점을 전제로,
다음 항목을 부드럽고 긍정적으로 설명해줘.

1. 첫인상
2. 성격적 특징
3. 강점
4. 주의할 점
5. 종합 한줄평
`;

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}
