"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { JobFAQ } from "@/types/jobs";

interface JobFAQSectionProps {
  faqs: JobFAQ[];
}

export function JobFAQSection({ faqs }: JobFAQSectionProps) {
  return (
    <ReportCard>
      <ReportSectionHeader
        title="Perguntas mais frequentes"
        subtitle="Respostas baseadas em entrevistas e feedback de candidatos"
      />

      <Accordion className="gap-2">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={faq.id}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 not-last:border-b"
          >
            <AccordionTrigger className="py-3.5 text-sm font-medium text-white hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-[#9CA3AF]">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ReportCard>
  );
}
