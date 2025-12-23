import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * 🚨 중요
 * Gemini SDK는 Edge Runtime에서 동작하지 않음
 * 반드시 Node.js Runtime으로 고정
 */
export const runtime = "nodejs";

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

    // base64 prefix 제거
    const base64Image = image.replace(
      /^data:image\/\w+;base64,/,
      ""
    );

    const genAI = new GoogleGenerativeAI(apiKey);

    const response = await genAI.models.generateContent({
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
      result: response.text,
    });
  } catch (err: any) {
    console.error("🔥 Gemini analyze error:", err);

    return NextResponse.json(
      {
        error: err?.message ?? "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
