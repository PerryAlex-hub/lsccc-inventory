export type TeamRole = "Administrator" | "Inventory officer";
export type Member = {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  active: boolean;
};
export type TeamInvitation = {
  id: string;
  email: string;
  role: TeamRole;
  createdAt: string;
  expiresAt: string;
  deliveryStatus: "pending" | "sent" | "failed";
};

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
