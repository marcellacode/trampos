import { Suspense } from "react";
import { EmpresaVagaEditorPage } from "@/components/dashboard/modules/empresa-vaga-editor-page";

export default function NovaVagaRoute() {
  return (
    <Suspense fallback={null}>
      <EmpresaVagaEditorPage />
    </Suspense>
  );
}
