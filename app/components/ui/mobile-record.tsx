import type { ReactNode } from "react";

export function MobileRecord({
  reference,
  title,
  date,
  status,
  details,
  actions,
}: {
  reference: string;
  title: string;
  date: ReactNode;
  status?: ReactNode;
  details: { label: string; value: ReactNode }[];
  actions?: ReactNode;
}) {
  return (
    <article className="min-w-0 border-t border-line p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
        <span>{reference}</span>
        {status}
      </div>
      <h3 className="text-base leading-6 font-semibold wrap-anywhere">{title}</h3>
      <div className="mt-1 text-xs leading-5 text-muted">{date}</div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {details.map((detail) => (
          <div key={detail.label} className="min-w-0">
            <dt className="text-xs text-muted">{detail.label}</dt>
            <dd className="mt-1 text-sm leading-6 wrap-anywhere">{detail.value}</dd>
          </div>
        ))}
      </dl>
      {actions && <div className="mt-3 border-t border-line pt-2">{actions}</div>}
    </article>
  );
}
