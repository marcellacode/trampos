"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { FAQ_ITEMS } from "@/lib/constants";

export function FAQ() {
  return (
    <section
      id="faq"
      className="landing-section-alt border-t border-white/5"
      aria-labelledby="faq-heading"
    >
      <Container>
        <SectionHeader
          label="FAQ"
          title="Perguntas frequentes"
          description="Tudo o que você precisa saber antes de começar."
          className="mb-10"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <Accordion className="glass-card divide-y divide-white/10">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-0 px-5 last:border-b-0"
              >
                <AccordionTrigger className="py-5 text-left text-base font-medium text-foreground hover:text-primary hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </Container>
    </section>
  );
}
