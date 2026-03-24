import OpenAI from "openai";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OPENAI_API_KEY is missing in .env.local" },
        { status: 500 }
      );
    }

    const { name, job, experience, skills } = await req.json();

    if (!name || !job || !experience || !skills) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const prompt = `
Generate a professional ATS-optimized resume for ${name}, targeting ${job}.

Experience: ${experience}
Skills/Education: ${skills}

Sections:
- Professional Summary
- Experience
- Skills
- Education

Use bullet points. Output plain text only.
`;

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const text = response.output_text?.trim();

    if (!text) {
      return Response.json(
        { error: "No resume text was generated" },
        { status: 500 }
      );
    }

    const pdfBytes = await textToPdf(text, name);

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName(name)}_resume.pdf"`,
      },
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 }
    );
  }
}

async function textToPdf(text: string, name: string) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  page.drawText(name.toUpperCase(), {
    x: margin,
    y,
    size: 18,
    font: bold,
    color: rgb(0, 0, 0),
  });

  y -= 28;

  const lines = text
    .replace(/\*\*/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const wrapped = wrapText(line, font, 10, maxWidth);

    for (const part of wrapped) {
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      page.drawText(part, {
        x: margin,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });

      y -= 14;
    }

    y -= 4;
  }

  return pdfDoc.save();
}

function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(test, size);

    if (width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function safeFileName(name: string) {
  return name.replace(/[<>:"/\\|?*]+/g, "_").trim();
}