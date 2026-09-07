import { MeetingDetailView } from "@/components/meeting-detail/MeetingDetailView";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <MeetingDetailView meetingId={Number(id)} />;
}
