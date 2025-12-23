import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "이미지 파일이 없습니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY가 없습니다.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    /**
     * 🔥 모델 이름 지정 ❌
     * → Google이 프로젝트에 맞는 모델 자동 선택
     */
    const model = genAI.getGenerativeModel({});

    const result = await model.generateContent([
      {
        text: `
이 사람의 얼굴을 관상 관점에서 분석해줘.

1. 첫인상
2. 성격
3. 장점
4. 단점
5. 인간관계 스타일

관상 해석임을 전제로 부드럽게 설명해줘.
        `.trim(),
      },
      {
        inlineData: {
          mimeType: imageFile.type || "image/png",
          data: base64Image,
        },
      },
    ]);

    return NextResponse.json({
      result: result.response.text(),
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "분석 중 서버 오류 발생" },
      { status: 500 }
    );
  }
}
