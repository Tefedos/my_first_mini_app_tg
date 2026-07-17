import { ProfilePage } from "@/components/profile-page";

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;

  return <ProfilePage userId={user_id} />;
}
