"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Member } from "../lib/access";

const AccountContext = createContext<Member | null>(null);

export function AccountProvider({
  user,
  children,
}: {
  user: Member;
  children: ReactNode;
}) {
  return <AccountContext.Provider value={user}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const user = useContext(AccountContext);
  if (!user) throw new Error("AccountProvider is required.");
  return user;
}
