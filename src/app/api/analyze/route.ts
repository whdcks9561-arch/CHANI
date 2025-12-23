export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image" }, { status: 400 });
    }

    const base64Image = image.replace(/^data:image\/\w+;base64,/, "");

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const response = await genAI.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            { text: "이 사진을 관상 관점에서 재미로 분석해줘." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    const text =
      response.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") ?? "분석 실패";

    return NextResponse.json({ result: text });
  } catch (e: any) {
    console.error("🔥 GEMINI ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
