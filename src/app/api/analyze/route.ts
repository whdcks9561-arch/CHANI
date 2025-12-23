export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "이 사진을 관상 관점에서 분석해줘" },
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
      { error: error.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
