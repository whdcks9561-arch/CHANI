import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");

    /**
     * ✅ 2025년 기준 유효한 모델
     */
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "이 사람의 얼굴을 관상 관점에서 분석해줘. 성격, 첫인상, 장단점을 중심으로 설명해줘.",
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini REST error:", data);
      return NextResponse.json(
        { error: "Gemini API error", detail: data },
        { status: 500 }
      );
    }

    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "분석 결과를 가져오지 못했습니다.";

    return NextResponse.json({ result });
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
