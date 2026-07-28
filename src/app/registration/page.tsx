import { MiniAppShell } from "@/components/mini-app-shell";
import { TelegramLaunchGuard } from "@/components/telegram-launch-guard";

export default function RegistrationPage() {
  return (
    <TelegramLaunchGuard>
      <MiniAppShell />
    </TelegramLaunchGuard>
  );
}
