"use client";

import { useEffect, useState } from "react";

export type TeamRole = "Administrator" | "Inventory officer";
export type TeamInvitation = {
  id: string;
  email: string;
  role: TeamRole;
  createdAt: string;
};

const STORAGE_KEY = "lsccc-team-invitations-v1";

export function useTeamAccess() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setInvitations(JSON.parse(saved) as TeamInvitation[]);
      } catch {
        // The team screen remains usable if browser storage is unavailable.
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invitations));
    } catch {
      // Changes remain available for the current session.
    }
  }, [invitations, ready]);

  const addInvitation = (rawEmail: string, role: TeamRole) => {
    const email = rawEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid work email address.";
    if (invitations.some((invitation) => invitation.email === email)) {
      return "An invitation for this address already exists.";
    }
    setInvitations((current) => [
      {
        id: crypto.randomUUID(),
        email,
        role,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    return null;
  };

  const changeRole = (id: string, role: TeamRole) => {
    setInvitations((current) =>
      current.map((invitation) =>
        invitation.id === id ? { ...invitation, role } : invitation,
      ),
    );
  };

  const cancelInvitation = (id: string) => {
    setInvitations((current) => current.filter((invitation) => invitation.id !== id));
  };

  return { invitations, addInvitation, changeRole, cancelInvitation };
}
