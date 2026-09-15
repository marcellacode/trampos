const TEXT_EXTENSIONS = /\.(txt|md|csv)$/i;
const MAX_RESUME_TEXT = 12_000;

function normalizeResumeText(text: string): string {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
}

function validateExtractedText(text: string): { text: string } | { error: string } {
  const normalized = normalizeResumeText(text);
  if (normalized.length < 50) {
    return { error: "Não foi possível extrair texto suficiente do currículo. Verifique se o arquivo contém texto legível." };
  }
  return { text: normalized.slice(0, MAX_RESUME_TEXT) };
}

export async function extractResumeText(
  file: File
): Promise<{ text: string } | { error: string }> {
  const name = file.name.toLowerCase();

  if (TEXT_EXTENSIONS.test(name) || file.type.startsWith("text/")) {
    try {
      return validateExtractedText(await file.text());
    } catch (error) {
      console.error("[resume.extract:text] failed", error instanceof Error ? error.message : "unknown");
      return { error: "Não foi possível ler o arquivo de texto." };
    }
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    let parser: { getText: () => Promise<{ text?: string }>; destroy: () => Promise<void> } | null = null;
    try {
      const { PDFParse } = await import("pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return validateExtractedText(result.text ?? "");
    } catch (error) {
      console.error("[resume.extract:pdf] failed", error instanceof Error ? error.message : "unknown");
      return { error: "Erro ao ler o PDF. Verifique se o arquivo não está corrompido, protegido ou composto apenas por imagens." };
    } finally {
      if (parser) {
        try { await parser.destroy(); } catch { /* cleanup only */ }
      }
    }
  }

  if (name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    try {
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      return validateExtractedText(result.value ?? "");
    } catch (error) {
      console.error("[resume.extract:docx] failed", error instanceof Error ? error.message : "unknown");
      return { error: "Erro ao ler o DOCX. Verifique se o arquivo não está corrompido ou protegido." };
    }
  }

  if (name.endsWith(".doc")) {
    return { error: "O formato .DOC antigo não é suportado. Salve o currículo como .DOCX ou PDF e tente novamente." };
  }

  return { error: "Formato não suportado. Envie um arquivo PDF ou DOCX." };
}
