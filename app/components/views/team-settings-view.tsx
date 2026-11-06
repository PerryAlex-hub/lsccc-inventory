"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDate } from "../../lib/demo-data";
import { useTeamAccess, type TeamRole } from "../../hooks/use-team-access";
import { InviteMemberPanel } from "../drawers/invite-member-panel";
import { Icon } from "../ui/icons";

export function TeamSettingsView() {
  const [inviting, setInviting] = useState(false);
  const { invitations, addInvitation, changeRole, cancelInvitation } = useTeamAccess();

  return (
    <div className="access-page">
      <section className="access-intro">
        <div>
          <span className="section-kicker">PEOPLE & PERMISSIONS</span>
          <h2>Team access</h2>
          <p>Control who can work with stock records and who can manage the workspace.</p>
        </div>
        <button className="button primary" onClick={() => setInviting(true)}>
          <Icon name="userPlus" size={17} /> Invite member
        </button>
      </section>

      <section className="surface access-table-card" aria-labelledby="people-title">
        <div className="access-section-heading">
          <div>
            <h3 id="people-title">People with access</h3>
            <p>One current administrator · {invitations.length} pending invitation{invitations.length === 1 ? "" : "s"}</p>
          </div>
          <span className="access-count">{invitations.length + 1} total</span>
        </div>
        <div className="access-member-list">
          <div className="access-member">
            <div className="member-avatar">AO</div>
            <div className="member-identity">
              <strong>Admin Officer <span className="you-label">You</span></strong>
              <small>Current account</small>
            </div>
            <span className="member-role">Administrator</span>
            <span className="access-state active">Active</span>
            <span className="member-action-placeholder" />
          </div>
          {invitations.map((invitation) => (
            <div className="access-member" key={invitation.id}>
              <div className="member-avatar invited"><Icon name="mail" size={18} /></div>
              <div className="member-identity">
                <strong>{invitation.email}</strong>
                <small>Added {formatDate(invitation.createdAt)}</small>
              </div>
              <label className="member-role-select">
                <span className="sr-only">Role for {invitation.email}</span>
                <select value={invitation.role} onChange={(event) => changeRole(invitation.id, event.target.value as TeamRole)}>
                  <option value="Inventory officer">Inventory officer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </label>
              <span className="access-state pending">Pending</span>
              <button className="icon-button member-remove" aria-label={`Cancel invitation for ${invitation.email}`} onClick={() => cancelInvitation(invitation.id)}>
                <Icon name="close" size={16} />
              </button>
            </div>
          ))}
        </div>
        {invitations.length === 0 && (
          <div className="access-empty">
            <Icon name="userPlus" size={19} />
            <span>Invite an inventory officer or another administrator to work with you.</span>
          </div>
        )}
      </section>

      <div className="access-lower-grid">
        <section className="surface permissions-card" aria-labelledby="roles-title">
          <div className="access-section-heading">
            <div><h3 id="roles-title">Roles and permissions</h3><p>Assign the access each person needs.</p></div>
          </div>
          <div className="permission-row">
            <span className="permission-icon"><Icon name="shield" size={19} /></span>
            <div><strong>Administrator</strong><p>Manage all inventory activity, reporting, members and roles.</p></div>
          </div>
          <div className="permission-row">
            <span className="permission-icon"><Icon name="box" size={19} /></span>
            <div><strong>Inventory officer</strong><p>Record receipts, issues, returns, stock counts and repairs; view reports.</p></div>
          </div>
        </section>
        <section className="surface organisation-card" aria-labelledby="organisation-title">
          <div className="access-section-heading">
            <div><h3 id="organisation-title">Organisation</h3><p>Workspace identity</p></div>
          </div>
          <div className="organisation-profile">
            <Image src="/lsccc-logo.jpg" alt="Lagos State Command and Control Centre crest" width={58} height={58} />
            <div><strong>Lagos State Command & Control Centre</strong><span>Inventory workspace</span></div>
          </div>
          <div className="organisation-detail"><span>Access owner</span><strong>Admin Officer</strong></div>
          <div className="organisation-detail"><span>Available roles</span><strong>2</strong></div>
        </section>
      </div>
      {inviting && <InviteMemberPanel onClose={() => setInviting(false)} onInvite={addInvitation} />}
    </div>
  );
}
