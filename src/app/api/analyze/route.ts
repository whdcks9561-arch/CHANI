import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs"; // ⚠️ 반드시 필요

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // base64 헤더 제거
    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY as string
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      {
        text: "이 사진을 관상 관점에서 자세히 분석해줘",
      },
    ]);

    return NextResponse.json({
      result: result.response.text(),
    });
  } catch (error: any) {
    console.error("🔥 analyze error:", error);

    return NextResponse.json(
      {
        error: "Gemini 분석 중 오류 발생",
        detail: error?.message,
      },
      { status: 500 }
    );
  }
}
