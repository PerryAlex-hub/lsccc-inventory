import { cn } from "@/app/lib/cn";
import { Table } from "@/app/components/ui/table";
import {
  equipmentName,
  formatDate,
  type Equipment,
  type Movement,
} from "../../lib/demo-data";
import { Icon, categoryIcon, type IconName } from "./icons";

export function Metric({
  icon,
  label,
  value,
  note,
  tone = "neutral",
}: {
  icon: IconName;
  label: string;
  value: number;
  note: string;
  tone?: "neutral" | "green" | "amber";
}) {
  return (
    <div
      className={cn(
        "min-h-30.75 rounded-[10px] border border-line bg-white pt-4.25 pb-3.75 transition-[border-color,transform]",
        "px-4.5 duration-200",
        "[&_strong]:block [&_strong]:text-[28px] [&_strong]:leading-[1] [&_strong]:tracking-[-.065em]",
        "[&_strong]:mt-2.25 [&_strong]:font-[740]",
        "[&_small]:mt-2 [&_small]:block [&_small]:text-[10px] [&_small]:text-[#8a9ba8]",
        "max-[681px]:min-h-28.25 max-[681px]:px-3.25 max-[681px]:py-3.25",
        "max-[681px]:[&_strong]:text-[24px]",
        "max-[681px]:[&_small]:text-[9px] max-[681px]:[&_small]:leading-[1.35]",
        "hover:-translate-y-0.5 hover:border-[#cdd4d9]",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2",
          "max-[391px]:items-start",
          "[&>span:first-child]:text-[10.5px] [&>span:first-child]:font-[650] [&>span:first-child]:text-[#71808a]",
          "max-[681px]:[&>span:first-child]:text-[9.5px]",
        )}
      >
        <span>{label}</span>
        <span
          className={cn(
            "grid h-7 w-7 place-items-center rounded-[7px] border border-[#e6ebee] bg-[#f4f6f7] text-[#596c78]",
            "max-[391px]:h-5.75 max-[391px]:w-5.75",
            "max-[391px]:[&_svg]:w-3.75",
            "[&[data-tone=green]]:bg-[#edf3ef] [&[data-tone=green]]:text-[#3f725b]",
            "[&[data-tone=amber]]:bg-[#fdf4e8] [&[data-tone=amber]]:text-[#b3793f]",
          )}
          data-tone={tone}
        >
          <Icon name={icon} size={19} />
        </span>
      </div>
      <strong>{value.toLocaleString("en-NG")}</strong>
      <small>{note}</small>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div
      className={cn(
        "col-span-full px-5 py-11.25 text-center",
        "[&>span]:mt-0 [&>span]:mb-3.25 [&>span]:grid [&>span]:h-11.25 [&>span]:w-11.25 [&>span]:place-items-center",
        "[&>span]:mx-auto [&>span]:rounded-[10px] [&>span]:bg-[#e8f0f6] [&>span]:text-[#7e8e9a]",
        "[&_h3]:text-[14px]",
        "[&_p]:mt-1.5 [&_p]:text-[11px] [&_p]:text-[#8b9ca9]",
      )}
    >
      <span>
        <Icon name="box" size={25} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

export function EquipmentTable({
  items,
  onSelect,
  empty = false,
}: {
  items: Equipment[];
  onSelect: (id: string) => void;
  empty?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[10px] border border-line bg-white",
        "[&_td]:h-17.25",
        "[&_th:first-child]:w-[32%]",
        "[&_td:first-child]:w-[32%]",
      )}
    >
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Category</th>
              <th>Total held</th>
              <th>Available</th>
              <th>Issued</th>
              <th>Faulty</th>
              <th aria-label="Details" />
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr
                key={e.id}
                onClick={() => onSelect(e.id)}
                className={cn(
                  "cursor-pointer transition-[background,border-color,color,transform,box-shadow] duration-160",
                  "hover:bg-[#fafcf9]",
                )}
              >
                <td>
                  <div
                    className={cn(
                      "flex items-center gap-2.75",
                      "[&_strong]:block [&_strong]:leading-[1.25]",
                      "[&_small]:mt-1",
                    )}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-[6px] border border-[#dfe7ec] bg-[#f6f8f9] text-[#465b67]">
                      <Icon name={categoryIcon(e.category)} size={21} />
                    </span>
                    <span>
                      <strong>{e.name}</strong>
                      <small>{e.id}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <span className="inline-block rounded-[5px] border border-[#e1e9ee] bg-[#f4f6f4] px-1.75 py-1.25 text-[9.5px] text-[#637079]">
                    {e.category}
                  </span>
                </td>
                <td className="tabular-nums">{e.available + e.issued}</td>
                <td className="tabular-nums">
                  <span
                    className={e.available <= e.reorder ? "font-bold text-[#aa732d]" : ""}
                  >
                    {e.available}
                  </span>
                </td>
                <td className="tabular-nums">{e.issued}</td>
                <td className="tabular-nums">
                  {e.faulty > 0 ? (
                    <span className="rounded-[5px] bg-[#fbf2e6] px-1.75 py-1 font-bold text-[#aa732d]">
                      {e.faulty}
                    </span>
                  ) : (
                    "â€”"
                  )}
                </td>
                <td>
                  <button
                    className={cn(
                      "grid place-items-center rounded-[5px] border-0 bg-transparent px-1.25 py-1.25 text-[#8b9daa]",
                      "hover:bg-[#e6edf3] hover:text-[#626f78]",
                    )}
                    aria-label={`View ${e.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(e.id);
                    }}
                  >
                    <Icon name="chevron" size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {empty && (
          <EmptyState
            title="No equipment found"
            message="Try another search or clear the filters to see all equipment."
          />
        )}
      </div>
    </div>
  );
}

export function MovementRow({
  movement,
  equipment,
  expanded = false,
}: {
  movement: Movement;
  equipment: Equipment[];
  expanded?: boolean;
}) {
  const icon: IconName =
    movement.type === "Receipt"
      ? "inbox"
      : movement.type === "Fault"
        ? "tool"
        : movement.type === "Repair"
          ? "check"
          : "arrows";
  return (
    <div
      className={cn(
        "flex min-h-13.75 items-center gap-3 border-b border-b-[#e4ebf1] px-0 py-2.25",
        "[&_time]:ml-auto [&_time]:text-[9.5px] [&_time]:whitespace-nowrap [&_time]:text-[#90a2af]",
        "[&[data-expanded=true]]:min-h-18.75",
        "[&[data-expanded=true]:last-child]:border-0",
      )}
      data-expanded={expanded}
    >
      <span
        className={cn(
          "grid h-7.75 w-7.75 place-items-center rounded-[7px] bg-[#f2f5f6] text-[#526773]",
          "[&[data-type=receipt]]:bg-[#edf3ef] [&[data-type=receipt]]:text-[#3f725b]",
          "[&[data-type=repair]]:bg-[#edf3ef] [&[data-type=repair]]:text-[#3f725b]",
          "[&[data-type=fault]]:bg-[#fdf3e5] [&[data-type=fault]]:text-[#b57b39]",
        )}
        data-type={movement.type.toLowerCase()}
      >
        <Icon name={icon} size={18} />
      </span>
      <div
        className={cn(
          "min-w-0 flex-1",
          "[&_strong]:text-[10.5px] [&_strong]:font-[710] [&_strong]:text-[#36424b]",
          "[&_strong_span]:font-[580] [&_strong_span]:text-[#5a666e]",
          "[&_p]:mt-1 [&_p]:overflow-hidden [&_p]:text-[10px] [&_p]:whitespace-nowrap [&_p]:text-[#8394a0]",
          "[&_p]:text-ellipsis",
          "[&_small]:mt-1.75 [&_small]:block [&_small]:text-[9px] [&_small]:text-[#8ea0ad]",
        )}
      >
        <strong>
          {movement.type} <span>Â· {equipmentName(equipment, movement.equipmentId)}</span>
        </strong>
        <p>{movement.description}</p>
        {expanded && (
          <small>
            {movement.id} Â· Recorded by {movement.actor}
          </small>
        )}
      </div>
      <time dateTime={movement.date}>{formatDate(movement.date)}</time>
    </div>
  );
}
