const TEXT_EXTENSIONS = /\.(txt|md|csv)$/i;

export async function extractResumeText(
  file: File
): Promise<{ text: string } | { error: string }> {
  const name = file.name.toLowerCase();

  if (TEXT_EXTENSIONS.test(name) || file.type.startsWith("text/")) {
    const text = await file.text();
    if (text.trim().length < 50) {
      return { error: "O arquivo de texto está vazio ou muito curto." };
    }
    return { text: text.slice(0, 12_000) };
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    try {
      const { PDFParse } = await import("pdf-parse");
      const buffer = Buffer.from(await file.arrayBuffer());
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();

      const text = result.text?.trim() ?? "";

      if (text.length < 50) {
        return {
          error:
            "Não foi possível extrair texto suficiente do PDF. Tente um arquivo com texto selecionável.",
        };
      }

      return { text: text.slice(0, 12_000) };
    } catch {
      return {
        error:
          "Erro ao ler o PDF. Verifique se o arquivo não está corrompido ou protegido.",
      };
    }
  }

  if (/\.docx?$/i.test(name)) {
    return {
      error:
        "Arquivos Word ainda não são suportados. Exporte seu currículo como PDF e tente novamente.",
    };
  }

  return {
    error: "Formato não suportado. Envie PDF ou arquivo de texto (.txt).",
  };
}
