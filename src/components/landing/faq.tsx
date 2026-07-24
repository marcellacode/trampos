"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { FAQ_ITEMS } from "@/lib/constants";

export function FAQ() {
  return (
    <section
      className="relative py-24 sm:py-32"
      aria-labelledby="faq-heading"
    >
      <Container>
        <SectionHeader
          label="FAQ"
          title="Perguntas frequentes"
          description="Tudo o que você precisa saber sobre o Jobera."
        />

        <div className="mx-auto max-w-3xl">
          <Accordion className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="overflow-hidden rounded-xl border border-white/8 bg-[#111315] px-6 transition-colors data-[state=open]:border-[#4F7CFF]/30"
              >
                <AccordionTrigger className="py-5 text-left text-base font-medium text-white hover:text-[#4F7CFF] hover:no-underline [&[data-state=open]]:text-[#4F7CFF]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-[#9CA3AF]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
