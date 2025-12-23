import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "이미지 파일이 전달되지 않았습니다." },
        { status: 400 }
      );
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    );

    // ✅ 핵심 수정: vision 지원 모델
    const model = genAI.getGenerativeModel({
      model: "models/gemini-pro",
    });

    const result = await model.generateContent([
      {
        text: "이 사진을 관상 관점에서 분석해줘",
      },
      {
        inlineData: {
          mimeType: image.type,
          data: buffer.toString("base64"),
        },
      },
    ]);

    const text =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text ??
      "분석 결과를 생성하지 못했습니다.";

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "서버 내부 오류" },
      { status: 500 }
    );
  }
}
