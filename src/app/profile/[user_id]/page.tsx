import { ProfilePage } from "@/components/profile-page";
import { TelegramLaunchGuard } from "@/components/telegram-launch-guard";

export default async function Page({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { user_id } = await params;

  return (
    <TelegramLaunchGuard>
      <ProfilePage userId={user_id} />
    </TelegramLaunchGuard>
  );
}
