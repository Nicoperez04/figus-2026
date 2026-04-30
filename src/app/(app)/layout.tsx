import { AppNav } from "@/components/nav";
import { requireUser } from "@/lib/auth";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <AppNav user={user} />
      {children}
    </div>
  );
}
