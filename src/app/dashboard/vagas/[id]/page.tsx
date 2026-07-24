import { JobDetailsPage } from "@/components/dashboard/jobs/job-details-page";

interface JobDetailRouteProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailRoute({ params }: JobDetailRouteProps) {
  const { id } = await params;
  return <JobDetailsPage jobId={id} />;
}
