"use client";

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
    <div className="drawer-layer">
      <button className="drawer-scrim" aria-label="Close invite form" onClick={onClose} />
      <aside className="drawer action-drawer" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <div className="drawer-head">
          <span>TEAM ACCESS</span>
          <button className="icon-button" aria-label="Close invite form" onClick={onClose}>
            <Icon name="close" size={19} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="drawer-body">
            <div className="form-intro">
              <span className="form-intro-icon"><Icon name="userPlus" size={24} /></span>
              <h2 id="invite-title">Invite a team member</h2>
              <p>Choose the access they need to work with inventory records.</p>
            </div>
            <label className="field">
              <span>Work email</span>
              <input type="email" autoComplete="email" required
                placeholder="name@organisation.gov.ng" value={email}
                onChange={(event) => { setEmail(event.target.value); setError(""); }} />
            </label>
            <label className="field">
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as TeamRole)}>
                <option value="Inventory officer">Inventory officer</option>
                <option value="Administrator">Administrator</option>
              </select>
            </label>
            <div className="role-explainer">
              <Icon name={role === "Administrator" ? "shield" : "box"} size={19} />
              <p>{role === "Administrator"
                ? "Can manage inventory, reports, team members and roles."
                : "Can record stock, issues, returns, maintenance and view reports."}</p>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
          </div>
          <div className="drawer-actions">
            <button type="button" className="button secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="button primary">Add invitation</button>
          </div>
        </form>
      </aside>
    </div>
  );
}
