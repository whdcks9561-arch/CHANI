import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "이미지가 없습니다" },
        { status: 400 }
      );
    }

    const base64Data = image.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const model = genAI.models.get({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          {
            text: `
이 사진을 보고 관상 관점에서 분석해줘.
과학적 사실이 아니라 재미와 참고용이라는 점을 전제로,
다음 항목을 부드럽고 긍정적으로 설명해줘.

1. 첫인상
2. 성격적 특징
3. 강점
4. 주의할 점
5. 종합 한줄평
            `,
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Data,
            },
          },
        ],
      },
    ]);

    return NextResponse.json({
      result: result.text,
    });
  } catch (error) {
    console.error("❌ 분석 실패:", error);
    return NextResponse.json(
      { error: "관상 분석 실패" },
      { status: 500 }
    );
  }
}
