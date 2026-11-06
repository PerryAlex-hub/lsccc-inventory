import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import InventoryWorkspace from "./components/inventory-workspace";
import { AccountProvider } from "./components/account-provider";
import { authenticated } from "./lib/server/http";
import { SESSION_COOKIE } from "./lib/server/accounts";
import { readInventory } from "./lib/server/inventory";
import { ApiError } from "./lib/server/security";

export default function Home() {
  return (
    <Suspense
      fallback={
        <main
          className="grid min-h-dvh place-items-center text-sm text-[#526573]"
          role="status"
        >
          Loading your workspace…
        </main>
      }
    >
      <Workspace />
    </Suspense>
  );
}

async function Workspace() {
  // Prisma generates transaction IDs synchronously; run authenticated reads per request.
  await connection();
  if (!(await cookies()).get(SESSION_COOKIE)?.value) redirect("/sign-in");
  const data = await authenticated(async (db, user) => ({
    user,
    state: await readInventory(db),
  })).catch((error) => {
    if (error instanceof ApiError && error.status === 401) redirect("/sign-in");
    throw error;
  });
  return (
    <AccountProvider user={data.user}>
      <InventoryWorkspace initialState={data.state} />
    </AccountProvider>
  );
}
