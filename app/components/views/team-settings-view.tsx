"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Icon } from "../ui/icons";
import { InviteMemberPanel } from "../drawers/invite-member-panel";
import { DeleteMemberDialog } from "../drawers/delete-member-dialog";
import { useAccount } from "../account-provider";
import { useTeamAccess } from "../../hooks/use-team-access";
import { initials, type Member } from "../../lib/access";
import { apiRequest } from "../../lib/api-client";
import { formatDateTime } from "../../lib/workspace-utils";

const roles = ["Inventory officer", "Administrator"].map((value) => ({
  value,
  label: value,
}));

export function TeamSettingsView() {
  const user = useAccount();
  const admin = user.role === "Administrator";
  const team = useTeamAccess(admin);
  const [inviting, setInviting] = useState(false);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function signOut() {
    setSigningOut(true);
    try {
      await apiRequest("/api/auth/sign-out", { method: "POST", body: {} });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Discard all prefetched account data after signing out.
      window.location.assign("/sign-in");
    } catch {
      setSignOutError("Couldn’t sign out. Check your connection and try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-lg border border-line bg-white p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Your account</h2>
          <p className="mt-2 text-sm wrap-anywhere">
            {user.name} · {user.email}
          </p>
          <p className="mt-1 text-xs text-muted">
            {user.role} · Lagos State Command & Control Centre
          </p>
        </div>
        <Button variant="secondary" disabled={signingOut} onClick={signOut}>
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
        {signOutError && (
          <p role="alert" className="w-full text-sm text-red-700">
            {signOutError}
          </p>
        )}
      </section>
      {admin && (
        <>
          <section className="flex flex-wrap items-end justify-between gap-5 rounded-lg border border-line bg-[#edf2f4] p-5 sm:p-6">
            <div>
              <h2 className="text-xl font-semibold">Team access</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                Invite staff by email and manage their permissions. Invitations expire
                after 48 hours; resending replaces the previous link.
              </p>
            </div>
            <Button
              variant="primary"
              disabled={team.busy}
              onClick={() => setInviting(true)}
            >
              <Icon name="userPlus" size={17} />
              Invite member
            </Button>
          </section>
          {team.error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              {team.error}
              <button className="ml-3 underline" onClick={team.refresh}>
                Reload team
              </button>
            </div>
          )}
          {team.notice && (
            <p
              role="status"
              className="rounded-lg border border-[#cadfce] bg-[#edf3ef] p-4 text-sm text-[#365641]"
            >
              {team.notice}
            </p>
          )}
          <section className="min-w-0 rounded-lg border border-line bg-white">
            <div className="p-5 sm:p-6">
              <h3 className="font-semibold">People with access</h3>
              <p className="mt-1 text-xs text-muted">
                Administrators manage members and roles. Inventory officers record
                receipts, issues, faults and repairs, and view reports.
              </p>
              <p className="mt-2 text-xs leading-5 text-muted">
                Revoke access to sign someone out immediately. Once access is revoked, you
                can permanently delete their account while keeping inventory and activity
                records.
              </p>
            </div>
            {team.loading && (
              <p role="status" className="p-5 text-sm text-muted">
                Loading team…
              </p>
            )}
            {team.members.map((member) => (
              <div
                key={member.id}
                role="group"
                aria-label={`Account: ${member.email}`}
                className="flex flex-wrap items-center gap-3 border-t border-line p-5 sm:px-6"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#dfe8ed] text-xs font-bold">
                  {initials(member.name)}
                </span>
                <div className="min-w-0 flex-1 basis-40">
                  <p className="text-sm font-semibold wrap-anywhere">
                    {member.name}
                    {member.id === user.id && " (You)"}
                  </p>
                  <p className="mt-1 text-xs wrap-anywhere text-muted">
                    {member.email} · {member.active ? "Active" : "Access disabled"}
                  </p>
                </div>
                <div className="w-full sm:w-44">
                  <Select
                    label={`Role for ${member.name}`}
                    value={member.role}
                    disabled={team.busy || member.id === user.id}
                    options={roles}
                    onValueChange={(role) => {
                      void team.update({
                        target: "member",
                        id: member.id,
                        action: "role",
                        role,
                      });
                    }}
                  />
                </div>
                {member.id !== user.id && (
                  <Button
                    variant="secondary"
                    disabled={team.busy}
                    onClick={() => {
                      void team.update({
                        target: "member",
                        id: member.id,
                        action: member.active ? "disable" : "enable",
                      });
                    }}
                  >
                    {member.active ? "Revoke access" : "Restore access"}
                  </Button>
                )}
                {member.id !== user.id && !member.active && (
                  <Button
                    variant="secondary"
                    disabled={team.busy}
                    onClick={() => setDeleting(member)}
                    className="text-red-700"
                  >
                    Delete user
                  </Button>
                )}
              </div>
            ))}
          </section>
          <section className="min-w-0 rounded-lg border border-line bg-white">
            <div className="p-5 sm:p-6">
              <h3 className="font-semibold">Pending invitations</h3>
              <p className="mt-1 text-xs text-muted">
                If delivery fails, check Brevo configuration and resend the invitation.
              </p>
            </div>
            {!team.loading && !team.invitations.length && (
              <p className="border-t border-line p-5 text-sm text-muted">
                No pending invitations.
              </p>
            )}
            {team.invitations.map((invitation) => (
              <div
                key={invitation.id}
                role="group"
                aria-label={`Invitation: ${invitation.email}`}
                className="flex flex-wrap items-center gap-3 border-t border-line p-5 sm:px-6"
              >
                <div className="min-w-0 flex-1 basis-48">
                  <p className="text-sm font-semibold wrap-anywhere">
                    {invitation.email}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(invitation.expiresAt) < new Date()
                      ? "Expired"
                      : `Expires ${formatDateTime(invitation.expiresAt)}`}{" "}
                    ·{" "}
                    {invitation.deliveryStatus === "sent"
                      ? "Sent to Brevo"
                      : invitation.deliveryStatus === "failed"
                        ? "Email failed — resend needed"
                        : "Sending email"}
                  </p>
                </div>
                <div className="w-full sm:w-44">
                  <Select
                    label={`Role for ${invitation.email}`}
                    value={invitation.role}
                    disabled={team.busy}
                    options={roles}
                    onValueChange={(role) => {
                      void team.update({
                        target: "invitation",
                        id: invitation.id,
                        action: "role",
                        role,
                      });
                    }}
                  />
                </div>
                <Button
                  variant="secondary"
                  disabled={team.busy}
                  onClick={() => {
                    void team.update({
                      target: "invitation",
                      id: invitation.id,
                      action: "resend",
                    });
                  }}
                >
                  Resend invitation
                </Button>
                <Button
                  variant="secondary"
                  disabled={team.busy}
                  onClick={() => {
                    void team.update({
                      target: "invitation",
                      id: invitation.id,
                      action: "cancel",
                    });
                  }}
                >
                  Revoke invitation
                </Button>
              </div>
            ))}
          </section>
        </>
      )}
      {inviting && (
        <InviteMemberPanel
          onClose={() => setInviting(false)}
          onInvite={team.addInvitation}
        />
      )}
      {admin && deleting && (
        <DeleteMemberDialog
          member={deleting}
          onClose={() => setDeleting(null)}
          onDelete={(confirmEmail) =>
            team.update({
              target: "member",
              id: deleting.id,
              action: "delete",
              confirmEmail,
            })
          }
        />
      )}
    </div>
  );
}
