import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing" },
        { status: 500 }
      );
    }

    // ✅ v1beta + 안정 모델
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro-vision:generateContent?key=" +
        apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "이 사진을 관상 관점에서 분석해줘. " +
                    "한국어로 부드럽고 긍정적으로 설명해줘.",
                },
                {
                  inlineData: {
                    mimeType: file.type,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini REST error:", err);
      return NextResponse.json(
        { error: "Gemini API 호출 실패" },
        { status: 500 }
      );
    }

    const json = await res.json();

    const text =
      json.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join("") ?? "분석 결과가 없습니다.";

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "서버 오류 (분석 실패)" },
      { status: 500 }
    );
  }
}
