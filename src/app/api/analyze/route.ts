import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid Content-Type" },
        { status: 400 }
      );
    }

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // ✅ v1beta에서 실제로 존재하는 모델 이름
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: file.type,
        },
      },
      {
        text: "이 사진을 관상 관점에서 분석해줘. 한국어로 부드럽게 설명해줘.",
      },
    ]);

    const text =
      result.response.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .join("") ??
      "분석 결과를 생성하지 못했습니다.";

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: "서버 오류 (분석 실패)" },
      { status: 500 }
    );
  }
}
