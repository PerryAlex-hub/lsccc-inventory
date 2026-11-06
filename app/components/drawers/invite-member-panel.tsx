"use client";

import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { Field, Input, Select } from "@/app/components/ui/form-fields";
import { useState, type FormEvent } from "react";
import type { TeamRole } from "../../hooks/use-team-access";
import { Icon } from "../ui/icons";

type Props = {
  onClose: () => void;
  onInvite: (email: string, role: TeamRole) => string | null;
};

export function InviteMemberPanel({ onClose, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("Inventory officer");
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextError = onInvite(email, role);
    if (nextError) setError(nextError);
    else onClose();
  };
  return (
    <div className="fixed [inset:0] z-50 flex justify-end">
      <button
        className="absolute [inset:0] cursor-default border-0 bg-[#1b22266b]"
        aria-label="Close invite form"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative z-1 flex h-dvh w-[min(460px,100vw)] flex-col bg-white shadow-[-20px_0_65px_#191f232b]",
          "animate-drawer-enter",
          "[&_form]:flex [&_form]:min-h-0 [&_form]:flex-1 [&_form]:flex-col",
          "max-md:w-[min(460px,100vw)]",
          "[&_form>div:first-child]:min-h-0",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center justify-between border-b border-b-line text-[10px] font-[760] tracking-[.12em]",
            "px-6.25 py-0 text-[#798994]",
          )}
        >
          <span>TEAM ACCESS</span>
          <button
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-[7px] border-0 bg-transparent text-[#697680]",
              "hover:bg-[#e8eff5] hover:text-primary",
            )}
            aria-label="Close invite form"
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <div
              className={cn(
                "[&_h2]:mt-2.25 [&_h2]:text-[24px] [&_h2]:tracking-[-.05em]",
                "[&_p]:mt-1.75 [&_p]:text-[12px] [&_p]:leading-[1.55] [&_p]:text-[#60717c]",
                "mb-6.75",
              )}
            >
              <span className="mb-4 grid h-12.75 w-12.75 place-items-center rounded-[7px] bg-[#f1f4f5] text-[#405b69]">
                <Icon name="userPlus" size={24} />
              </span>
              <h2 id="invite-title">Invite a team member</h2>
              <p>Choose the access they need to work with inventory records.</p>
            </div>
            <Field>
              <span>Work email</span>
              <Input
                type="email"
                autoComplete="email"
                required
                placeholder="name@organisation.gov.ng"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
              />
            </Field>
            <Field>
              <span>Role</span>
              <Select
                label="Role"
                value={role}
                onValueChange={(value) => setRole(value as TeamRole)}
                options={["Inventory officer", "Administrator"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Field>
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-[6px] border border-[#e5eaed] bg-[#f1f4f5] px-3.5 py-3.25 text-[#405966]",
                "[&_p]:mx-0 [&_p]:my-0 [&_p]:text-[11px] [&_p]:leading-[1.5] [&_p]:text-[#5d6d77]",
              )}
            >
              <Icon name={role === "Administrator" ? "shield" : "box"} size={19} />
              <p>
                {role === "Administrator"
                  ? "Can manage inventory, reports, team members and roles."
                  : "Can record stock, issues, returns, maintenance and view reports."}
              </p>
            </div>
            {error && (
              <p
                className={cn(
                  "flex items-start gap-2 rounded-[7px] border border-[#f3d5cb] bg-[#fbeeea] px-2.75 text-[11px] text-[#a45e4c]",
                  "mx-0 my-2.5 py-2.75",
                )}
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex shrink-0 justify-end gap-2.25 border-t border-t-line bg-white px-4 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-6",
              "[&>button]:flex-1",
            )}
          >
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add invitation
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
