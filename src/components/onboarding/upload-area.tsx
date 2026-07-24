"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCEPTED_RESUME_TYPES } from "@/lib/onboarding/constants";

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  onCancel?: () => void;
  error?: string | null;
  isUploading?: boolean;
  className?: string;
}

function isValidResume(file: File) {
  const typeOk =
    (ACCEPTED_RESUME_TYPES as readonly string[]).includes(file.type) ||
    /\.(pdf|docx?)$/i.test(file.name);
  const sizeOk = file.size <= 10 * 1024 * 1024;
  return typeOk && sizeOk;
}

export function UploadArea({
  onFileSelect,
  onCancel,
  error,
  isUploading = false,
  className,
}: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;

      if (!isValidResume(file)) {
        setLocalError("Arquivo inválido. Envie um PDF ou DOCX de até 10MB.");
        return;
      }

      setLocalError(null);
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const displayError = error ?? localError;

  return (
    <div className={cn("w-full space-y-3", className)}>
      <motion.div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        animate={{
          scale: dragging ? 1.01 : 1,
          borderColor: dragging
            ? "rgba(79, 124, 255, 0.7)"
            : displayError
              ? "rgba(239, 68, 68, 0.5)"
              : "rgba(255, 255, 255, 0.1)",
        }}
        className={cn(
          "relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-dashed bg-[#111315]/70 px-6 py-10 text-center backdrop-blur-sm transition-colors",
          dragging && "bg-[#4F7CFF]/5",
          isUploading && "pointer-events-none opacity-70"
        )}
        role="button"
        tabIndex={0}
        aria-label="Área de upload de currículo. Arraste um PDF ou DOCX, ou pressione Enter para selecionar."
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4F7CFF]/15 blur-3xl transition-opacity",
              dragging ? "opacity-100" : "opacity-40"
            )}
          />
        </div>

        <motion.div
          animate={{ y: dragging ? -6 : 0 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30"
        >
          {isUploading ? (
            <FileText className="h-6 w-6 animate-pulse text-[#4F7CFF]" />
          ) : (
            <Upload className="h-6 w-6 text-[#4F7CFF]" />
          )}
        </motion.div>

        <div className="relative space-y-1.5">
          <p className="text-base font-medium text-white sm:text-lg">
            {isUploading
              ? "Enviando currículo..."
              : dragging
                ? "Solte o arquivo aqui"
                : "Arraste um PDF ou DOCX"}
          </p>
          <p className="text-sm text-[#9CA3AF]">
            ou clique para selecionar · até 10MB
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          aria-hidden="true"
          tabIndex={-1}
        />
      </motion.div>

      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-sm text-[#9CA3AF] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/60 rounded-md"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Voltar às opções
        </button>
      )}
    </div>
  );
}
