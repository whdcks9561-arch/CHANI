export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

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

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }

    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await genAI.models.generateContent({
      model: "gemini-1.5-pro", // 🔥 flash → pro
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

    console.log("✅ Gemini raw response:", JSON.stringify(response, null, 2));

    const text =
      response.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") ?? "분석 결과를 생성하지 못했습니다.";

    return NextResponse.json({ result: text });
  } catch (err: any) {
    console.error("🔥 ANALYZE ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
