import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs"; // ⭐ 반드시 필요 (Edge 아님)

export async function POST(req: NextRequest) {
  try {
    // 1. 환경변수 체크
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 2. 요청 body 파싱
    const body = await req.json();
    const { image } = body; // ⭐ 프론트(Camera.tsx)와 이름 일치

    if (!image) {
      return NextResponse.json(
        { error: "이미지가 전달되지 않았습니다." },
        { status: 400 }
      );
    }

    // 3. Gemini 클라이언트 생성
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // 4. 프롬프트
    const prompt = `
이 사진 속 인물의 관상을 분석해 주세요.

- 얼굴형
- 눈, 코, 입 인상
- 전체적인 성향
- 직업/대인관계/재물운 경향

너무 미신적이지 않게,
부드럽고 재미있는 톤으로 설명해 주세요.
`;

    // 5. Gemini 호출
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: image, // ⭐ base64 (data:image/... 제거된 상태)
        },
      },
    ]);

    const text = result.response.text();

    // 6. 응답 반환
    return NextResponse.json({
      success: true,
      result: text,
    });
  } catch (error) {
    console.error("❌ analyze API error:", error);

    return NextResponse.json(
      {
        error: "서버 내부 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
