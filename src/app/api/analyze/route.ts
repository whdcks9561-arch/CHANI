import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "이미지가 없습니다." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 없음");
    }

    // ✅ 2025년 기준 정상 모델 + v1
    const endpoint =
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-8b:generateContent";

    const res = await fetch(`${endpoint}?key=${apiKey}`, {
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
                text: "이 사람의 관상을 분석해줘. 성격, 인상, 장단점을 중심으로 설명해줘.",
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

    const json = await res.json();

    if (!res.ok) {
      console.error("Gemini REST error:", json);
      throw new Error(json?.error?.message || "Gemini API 오류");
    }

    const result =
      json.candidates?.[0]?.content?.parts?.[0]?.text ??
      "분석 결과를 생성하지 못했습니다.";

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "분석 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
