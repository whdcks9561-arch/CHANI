import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

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

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "이 사진을 관상 관점에서 재미로 분석해줘." },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      result: result.text,
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
