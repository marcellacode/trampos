import { EmpresaVagaEditorPage } from "@/components/dashboard/modules/empresa-vaga-editor-page";

interface EditVagaRouteProps {
  params: Promise<{ id: string }>;
}

export default async function EditVagaRoute({ params }: EditVagaRouteProps) {
  const { id } = await params;
  return <EmpresaVagaEditorPage jobId={id} />;
}
