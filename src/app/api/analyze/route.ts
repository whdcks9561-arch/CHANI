import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ FormData 파싱
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "이미지 파일이 없습니다." },
        { status: 400 }
      );
    }

    // 2️⃣ 이미지 → base64
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");

    // 3️⃣ API 키
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 환경변수가 없습니다.");
    }

    // 4️⃣ Gemini SDK 초기화
    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ 가장 안정적이고 항상 열려 있는 모델
    const model = genAI.getGenerativeModel({
      model: "gemini-1.0-pro",
    });

    // 5️⃣ 요청 (텍스트 + 이미지)
    const result = await model.generateContent([
      {
        text: `
이 사람의 얼굴을 관상 관점에서 분석해줘.

다음 항목을 포함해줘:
1. 첫인상
2. 성격적 특징
3. 장점
4. 단점
5. 인간관계 스타일

관상 해석임을 전제로 부드럽고 긍정적으로 설명해줘.
        `.trim(),
      },
      {
        inlineData: {
          mimeType: imageFile.type || "image/png",
          data: base64Image,
        },
      },
    ]);

    // 6️⃣ 결과 반환
    return NextResponse.json({
      result: result.response.text(),
    });
  } catch (error) {
    console.error("Analyze API error:", error);

    return NextResponse.json(
      { error: "분석 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
