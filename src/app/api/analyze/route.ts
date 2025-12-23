import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "이미지 없음" }, { status: 400 });
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY 없음");
    }

    // ✅ 실제 존재하는 유일한 모델 + v1beta
    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: "이 사람의 관상을 분석해줘. 성격, 인상, 장단점을 설명해줘." },
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
      "분석 결과 없음";

    return NextResponse.json({ result });
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json(
      { error: "서버 분석 오류" },
      { status: 500 }
    );
  }
}
