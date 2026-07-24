import type { GoalChip } from "@/types/onboarding";

const SKILL_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\breact\b/i, label: "React" },
  { pattern: /\bnext\.?js\b/i, label: "Next.js" },
  { pattern: /\btypescript\b|\bts\b/i, label: "TypeScript" },
  { pattern: /\bjavascript\b|\bjs\b/i, label: "JavaScript" },
  { pattern: /\bnode\.?js\b/i, label: "Node.js" },
  { pattern: /\bfrontend|front[- ]?end\b/i, label: "Frontend" },
  { pattern: /\bbackend|back[- ]?end\b/i, label: "Backend" },
  { pattern: /\bfull[- ]?stack\b/i, label: "Full Stack" },
  { pattern: /\btailwind\b/i, label: "TailwindCSS" },
  { pattern: /\bpython\b/i, label: "Python" },
  { pattern: /\bproduct manager|\bpm\b/i, label: "Product Manager" },
  { pattern: /\bux|ui\/ux|designer\b/i, label: "Design" },
  { pattern: /\bdata scientist|ciência de dados\b/i, label: "Data Science" },
];

/**
 * Lightweight client-side goal parser.
 * Ready to be replaced by OpenAI / Anthropic interpretation endpoints.
 */
export function parseGoalText(text: string): GoalChip[] {
  const chips: GoalChip[] = [];
  const seen = new Set<string>();

  const push = (label: string, category: GoalChip["category"]) => {
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    chips.push({
      id: `chip-${category}-${key.replace(/\s+/g, "-")}`,
      label,
      category,
    });
  };

  for (const { pattern, label } of SKILL_PATTERNS) {
    if (pattern.test(text)) {
      const isRole =
        /frontend|backend|full.?stack|product manager|design|data science/i.test(
          label
        );
      push(label, isRole && !/react|next|type|tailwind|node|python|javascript/i.test(label) ? "role" : "skill");
    }
  }

  if (/desenvolvedor|developer|engenheir/i.test(text)) {
    const roleMatch = text.match(
      /(?:como|de|como uma?)\s+([^.!?\n,]{4,60}?)(?:,|\.|$|remoto|recebendo|ganhando)/i
    );
    if (roleMatch?.[1]) {
      push(roleMatch[1].trim().replace(/\s+/g, " "), "role");
    } else if (/front[- ]?end/i.test(text)) {
      push("Desenvolvedora Front-end", "role");
    }
  }

  if (/\bremoto\b|\bremote\b/i.test(text)) push("Remoto", "model");
  if (/\bh[ií]brido\b|\bhybrid\b/i.test(text)) push("Híbrido", "model");
  if (/\bpresencial\b|\bonsite\b/i.test(text)) push("Presencial", "model");

  if (/\bclt\b/i.test(text)) push("CLT", "contract");
  if (/\bpj\b/i.test(text)) push("PJ", "contract");
  if (/\bfreelancer\b|\bfree[- ]?lance\b/i.test(text))
    push("Freelancer", "contract");

  const salaryMatch = text.match(
    /(?:r\$\s*)?(\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?|\d+)(?:\s*\+)?/i
  );
  if (salaryMatch && /sal[aá]rio|recebendo|ganhando|acima|r\$/i.test(text)) {
    const raw = salaryMatch[1].replace(/[.\s]/g, "");
    const amount = Number(raw);
    if (amount >= 1000) {
      push(`R$${amount.toLocaleString("pt-BR")}+`, "salary");
    }
  }

  if (/\bbrasil\b|\bbrasileir/i.test(text)) push("Brasil", "location");
  if (/\bs[aã]o paulo\b|\bsp\b/i.test(text)) push("São Paulo", "location");
  if (/\brio de janeiro\b|\brj\b/i.test(text))
    push("Rio de Janeiro", "location");
  if (/\binternacional\b|\bexterior\b|\beua\b|\beuropa\b/i.test(text))
    push("Internacional", "location");

  // Free-text fallback so the user can continue even without keyword matches.
  if (chips.length === 0 && text.trim().length >= 10) {
    const summary = text.trim().replace(/\s+/g, " ").slice(0, 48);
    push(summary.endsWith("...") || summary.length < 48 ? summary : `${summary}…`, "role");
  }

  return chips;
}
