"use client";

import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { Select } from "../ui/select";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "../../lib/demo-data";
import { useTeamAccess, type TeamRole } from "../../hooks/use-team-access";
import { InviteMemberPanel } from "../drawers/invite-member-panel";
import { Icon } from "../ui/icons";

export function TeamSettingsView() {
  const [inviting, setInviting] = useState(false);
  const { invitations, addInvitation, changeRole, cancelInvitation } = useTeamAccess();
  return (
    <div className="grid gap-4.5">
      <section
        className={cn(
          "flex items-end justify-between gap-6 rounded-[8px] border border-[#e0e8ec] bg-[#edf2f4] px-6.5 py-6",
          "[&_h2]:mt-2.25 [&_h2]:text-[22px] [&_h2]:font-[720] [&_h2]:text-[#263b47]",
          "[&_p]:mt-1.5 [&_p]:text-[12px] [&_p]:leading-[1.5] [&_p]:text-[#6e7a82]",
          "max-[561px]:flex-col max-[561px]:items-start max-[561px]:px-5.25 max-[561px]:py-5.25",
        )}
      >
        <div>
          <span className="text-[9px] font-[780] tracking-[.16em] text-[#798994]">
            PEOPLE & PERMISSIONS
          </span>
          <h2>Team access</h2>
          <p>Control who can work with stock records and who can manage the workspace.</p>
        </div>
        <Button onClick={() => setInviting(true)} variant="primary">
          <Icon name="userPlus" size={17} /> Invite member
        </Button>
      </section>

      <section
        className="rounded-[8px] border border-line bg-white"
        aria-labelledby="people-title"
      >
        <div
          className={cn(
            "[&_p]:mt-1.5 [&_p]:text-[12px] [&_p]:leading-[1.5] [&_p]:text-[#6e7a82]",
            "flex items-start justify-between gap-5 px-6.25 pt-5.5 pb-4.75",
            "[&_h3]:text-[15px] [&_h3]:font-[720] [&_h3]:tracking-[-.025em]",
            "max-[561px]:px-5 max-[561px]:py-5",
          )}
        >
          <div>
            <h3 id="people-title">People with access</h3>
            <p>
              One current administrator · {invitations.length} pending invitation
              {invitations.length === 1 ? "" : "s"}
            </p>
          </div>
          <span className="text-[11px] font-[650] whitespace-nowrap text-[#65727b]">
            {invitations.length + 1} total
          </span>
        </div>
        <div>
          <div
            className={cn(
              "grid min-h-18.5 grid-cols-[38px_minmax(0,1fr)_165px_76px_34px] items-center gap-3.5 border-t border-t-line",
              "px-6.25 py-3",
              "max-[801px]:grid-cols-[38px_minmax(0,1fr)_34px]",
              "max-[561px]:px-5 max-[561px]:py-3",
            )}
          >
            <div className="grid h-9 w-9 place-items-center rounded-[7px] bg-[#dfe8ed] text-[11px] font-[760] text-[#2c4958]">
              AO
            </div>
            <div
              className={cn(
                "min-w-0",
                "[&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:whitespace-nowrap",
                "[&_strong]:text-[12px] [&_strong]:font-[690]",
                "[&_small]:mt-1 [&_small]:block [&_small]:text-[10.5px] [&_small]:text-[#8a979f]",
              )}
            >
              <strong>
                Admin Officer{" "}
                <span className="ml-1.5 text-[10px] font-[560] text-[#88949b]">You</span>
              </strong>
              <small>Current account</small>
            </div>
            <span
              className={cn(
                "text-[11.5px] font-[620] text-[#43525c]",
                "max-[801px]:col-start-2",
              )}
            >
              Administrator
            </span>
            <span
              className={cn(
                "text-[10.5px] font-[710] text-[#3f725b]",
                "max-[801px]:col-start-2 max-[801px]:row-start-3",
              )}
            >
              Active
            </span>
            <span
              className={cn(
                "w-8.5",
                "max-[801px]:col-start-3 max-[801px]:[grid-row:1_/_span_3]",
              )}
            />
          </div>
          {invitations.map((invitation) => (
            <div
              className={cn(
                "grid min-h-18.5 grid-cols-[38px_minmax(0,1fr)_165px_76px_34px] items-center gap-3.5 border-t border-t-line",
                "px-6.25 py-3",
                "max-[801px]:grid-cols-[38px_minmax(0,1fr)_34px]",
                "max-[561px]:px-5 max-[561px]:py-3",
              )}
              key={invitation.id}
            >
              <div className="grid h-9 w-9 place-items-center rounded-[7px] bg-[#f0f2f3] text-[11px] font-[760] text-[#71818b]">
                <Icon name="mail" size={18} />
              </div>
              <div
                className={cn(
                  "min-w-0",
                  "[&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:whitespace-nowrap",
                  "[&_strong]:text-[12px] [&_strong]:font-[690]",
                  "[&_small]:mt-1 [&_small]:block [&_small]:text-[10.5px] [&_small]:text-[#8a979f]",
                )}
              >
                <strong>{invitation.email}</strong>
                <small>Added {formatDate(invitation.createdAt)}</small>
              </div>
              <div className="min-w-0 max-[801px]:col-start-2">
                <Select
                  label={`Role for ${invitation.email}`}
                  value={invitation.role}
                  onValueChange={(value) => changeRole(invitation.id, value as TeamRole)}
                  options={["Inventory officer", "Administrator"].map((value) => ({
                    value,
                    label: value,
                  }))}
                />
              </div>

              <span
                className={cn(
                  "text-[10.5px] font-[710] text-[#966c3a]",
                  "max-[801px]:col-start-2 max-[801px]:row-start-3",
                )}
              >
                Pending
              </span>
              <button
                className={cn(
                  "grid h-8.25 w-8.25 place-items-center rounded-[7px] border-0 bg-transparent text-[#8a979f]",
                  "max-[801px]:col-start-3 max-[801px]:[grid-row:1_/_span_3]",
                  "hover:bg-[#e8eff5] hover:text-primary",
                )}
                aria-label={`Cancel invitation for ${invitation.email}`}
                onClick={() => cancelInvitation(invitation.id)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          ))}
        </div>
        {invitations.length === 0 && (
          <div
            className={cn(
              "flex items-center gap-2.25 border-t border-t-line px-6.25 py-4.25 text-[11.5px] text-[#77858e]",
              "max-[561px]:px-5 max-[561px]:py-4.25",
            )}
          >
            <Icon name="userPlus" size={19} />
            <span>
              Invite an inventory officer or another administrator to work with you.
            </span>
          </div>
        )}
      </section>

      <div
        className={cn(
          "grid grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)] gap-4.5",
          "max-[801px]:grid-cols-[1fr]",
        )}
      >
        <section
          className="rounded-[8px] border border-line bg-white"
          aria-labelledby="roles-title"
        >
          <div
            className={cn(
              "[&_p]:mt-1.5 [&_p]:text-[12px] [&_p]:leading-[1.5] [&_p]:text-[#6e7a82]",
              "flex items-start justify-between gap-5 px-6.25 pt-5.5 pb-4.75",
              "[&_h3]:text-[15px] [&_h3]:font-[720] [&_h3]:tracking-[-.025em]",
              "max-[561px]:px-5 max-[561px]:py-5",
            )}
          >
            <div>
              <h3 id="roles-title">Roles and permissions</h3>
              <p>Assign the access each person needs.</p>
            </div>
          </div>
          <div
            className={cn(
              "mx-6.25 my-0 flex items-start gap-3.25 border-t border-t-line px-0 py-4.25",
              "[&_strong]:text-[12px] [&_strong]:font-[690]",
              "[&_p]:mt-1.25 [&_p]:text-[11px] [&_p]:leading-[1.5] [&_p]:text-[#7b8991]",
              "max-[561px]:mx-5 max-[561px]:my-0",
            )}
          >
            <span className="grid h-8.5 w-8.5 flex-none place-items-center rounded-[6px] bg-[#eef2f4] text-[#3d5663]">
              <Icon name="shield" size={19} />
            </span>
            <div>
              <strong>Administrator</strong>
              <p>Manage all inventory activity, reporting, members and roles.</p>
            </div>
          </div>
          <div
            className={cn(
              "mx-6.25 my-0 flex items-start gap-3.25 border-t border-t-line px-0 py-4.25",
              "[&_strong]:text-[12px] [&_strong]:font-[690]",
              "[&_p]:mt-1.25 [&_p]:text-[11px] [&_p]:leading-[1.5] [&_p]:text-[#7b8991]",
              "max-[561px]:mx-5 max-[561px]:my-0",
            )}
          >
            <span className="grid h-8.5 w-8.5 flex-none place-items-center rounded-[6px] bg-[#eef2f4] text-[#3d5663]">
              <Icon name="box" size={19} />
            </span>
            <div>
              <strong>Inventory officer</strong>
              <p>Record receipts, equipment issues and repairs; view reports.</p>
            </div>
          </div>
        </section>
        <section
          className="rounded-[8px] border border-line bg-white"
          aria-labelledby="organisation-title"
        >
          <div
            className={cn(
              "[&_p]:mt-1.5 [&_p]:text-[12px] [&_p]:leading-[1.5] [&_p]:text-[#6e7a82]",
              "flex items-start justify-between gap-5 px-6.25 pt-5.5 pb-4.75",
              "[&_h3]:text-[15px] [&_h3]:font-[720] [&_h3]:tracking-[-.025em]",
              "max-[561px]:px-5 max-[561px]:py-5",
            )}
          >
            <div>
              <h3 id="organisation-title">Organisation</h3>
              <p>Workspace identity</p>
            </div>
          </div>
          <div
            className={cn(
              "[&_strong]:text-[12px] [&_strong]:font-[690]",
              "mx-6.25 mt-0 mb-5 flex items-center gap-3.5 rounded-[6px] border border-[#e5eaed] bg-[#f9fafb] px-3.75 py-3.75",
              "[&_img]:h-14.5 [&_img]:w-14.5 [&_img]:flex-none [&_img]:object-contain",
              "[&_span]:mt-1 [&_span]:block [&_span]:text-[10.5px] [&_span]:text-[#7b8991]",
              "max-[561px]:mx-5",
            )}
          >
            <Image
              src="/lsccc-logo.jpg"
              alt="Lagos State Command and Control Centre crest"
              width={58}
              height={58}
            />
            <div>
              <strong>Lagos State Command & Control Centre</strong>
              <span>Inventory workspace</span>
            </div>
          </div>
          <div
            className={cn(
              "mx-6.25 flex items-center justify-between gap-3.75 border-t border-t-line px-0 py-3 text-[11px] text-[#79868e]",
              "my-0",
              "[&_strong]:font-[660] [&_strong]:text-[#364955]",
              "max-[561px]:mx-5",
            )}
          >
            <span>Access owner</span>
            <strong>Admin Officer</strong>
          </div>
          <div
            className={cn(
              "mx-6.25 flex items-center justify-between gap-3.75 border-t border-t-line px-0 py-3 text-[11px] text-[#79868e]",
              "my-0",
              "[&_strong]:font-[660] [&_strong]:text-[#364955]",
              "max-[561px]:mx-5",
            )}
          >
            <span>Available roles</span>
            <strong>2</strong>
          </div>
        </section>
      </div>
      <Link
        href="/sign-in"
        className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        Account sign-in <Icon name="arrow" size={16} />
      </Link>
      {inviting && (
        <InviteMemberPanel onClose={() => setInviting(false)} onInvite={addInvitation} />
      )}
    </div>
  );
}
