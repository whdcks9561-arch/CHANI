import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs"; // ⭐ 중요 (edge 아님)

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const image = body.image;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    // base64 헤더 제거
    const base64Image = image.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        role: "user",
        parts: [
          {
            text: `
이 사진을 보고 관상 관점에서 분석해줘.
과학적 근거가 아닌 재미와 참고용으로,
부드럽고 긍정적으로 설명해줘.

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
              data: base64Image,
            },
          },
        ],
      },
    ]);

    return NextResponse.json({
      result: result.response.text(),
    });
  } catch (error: any) {
    console.error("🔥 analyze error:", error);

    return NextResponse.json(
      {
        error: error?.message ?? "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
