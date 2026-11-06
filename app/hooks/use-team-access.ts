"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../lib/api-client";
import type { Member, TeamInvitation, TeamRole } from "../lib/access";
export type { TeamInvitation, TeamRole } from "../lib/access";

type Team = { members: Member[]; invitations: TeamInvitation[] };
type TeamResponse = Team & { mailDelivery?: "sent" | "failed" };

export function useTeamAccess(enabled: boolean) {
  const [team, setTeam] = useState<Team>({ members: [], invitations: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const saving = useRef(false);
  const refresh = useCallback(async () => {
    try {
      const result = await apiRequest<Team>("/api/team");
      setTeam(result);
      setError("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Couldn’t load the team.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    apiRequest<Team>("/api/team", { signal: controller.signal })
      .then((result) => {
        setTeam(result);
        setError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setError(error instanceof Error ? error.message : "Couldn’t load the team.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [enabled]);

  async function change(body: unknown, method = "PATCH") {
    if (saving.current) return "Another team change is being saved. Please wait.";
    saving.current = true;
    setBusy(true);
    setNotice("");
    try {
      const result = await apiRequest<TeamResponse>("/api/team", { method, body });
      setTeam(result);
      setError("");
      if (result.mailDelivery === "failed") {
        setError(
          "The invitation was saved, but its email could not be sent. Check Brevo configuration, then use Resend invitation.",
        );
      } else if (result.mailDelivery === "sent") {
        setNotice(
          "Invitation email sent. Resending replaces any previous invitation link.",
        );
      } else {
        const action = (body as { action?: string }).action;
        setNotice(
          action === "cancel"
            ? "Invitation revoked. Its link can no longer be used."
            : action === "disable"
              ? "Access revoked. Existing sessions and reset links have been removed."
              : action === "enable"
                ? "Access restored. This person can sign in again."
                : action === "delete"
                  ? "Account deleted. Inventory and activity records have been kept."
                  : "Team access updated.",
        );
      }
      return null;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Couldn’t save this change.";
      setError(message);
      await refresh();
      setError(message);
      return message;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return {
    ...team,
    error,
    loading,
    busy,
    notice,
    refresh,
    addInvitation: (email: string, role: TeamRole) => change({ email, role }, "POST"),
    update: change,
  };
}
