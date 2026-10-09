import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OutageList, CreateOutageForm } from "@/components/outage-forms";
import { LogoutButton } from "@/components/logout-button";

interface OutageRow {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  status: string;
  note: string | null;
}

async function getOutages(userId: string): Promise<OutageRow[]> {
  const outages = await prisma.outage.findMany({
    where: { userId },
    orderBy: { startTime: "desc" },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      duration: true,
      status: true,
      note: true,
    },
  });
  return outages.map((o) => ({
    id: o.id,
    startTime: o.startTime.toISOString(),
    endTime: o.endTime?.toISOString() ?? null,
    duration: o.duration,
    status: o.status,
    note: o.note,
  }));
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  let outages: OutageRow[];
  try {
    outages = await getOutages(session.userId);
  } catch (error) {
    console.error("Load dashboard outages failed:", error);
    throw new Error("Unable to load dashboard outages");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">GridLog Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {session.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CreateOutageForm />
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Your Outages</h2>
            <OutageList outages={outages} />
          </div>
        </div>
      </main>
    </div>
  );
}
