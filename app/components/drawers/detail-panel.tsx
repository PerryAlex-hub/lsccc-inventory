import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import type { Equipment, Movement } from "../../lib/demo-data";
import { Icon, categoryIcon } from "../ui/icons";
import { MovementRow } from "../ui/inventory-widgets";

export function DetailPanel({
  item,
  movements,
  onClose,
  onEdit,
  onIssue,
  onReceive,
}: {
  item: Equipment;
  movements: Movement[];
  onClose: () => void;
  onEdit: () => void;
  onIssue: () => void;
  onReceive: () => void;
}) {
  return (
    <div className="fixed [inset:0] z-50 flex justify-end">
      <button
        className="absolute [inset:0] cursor-default border-0 bg-[#1b22266b]"
        aria-label="Close equipment details"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative z-1 flex h-dvh w-[min(460px,100vw)] flex-col bg-white shadow-[-20px_0_65px_#191f232b]",
          "animate-drawer-enter",
          "max-[681px]:w-[min(460px,100vw)]",
        )}
        aria-label={`${item.name} details`}
      >
        <div
          className={cn(
            "flex h-16 items-center justify-between border-b border-b-line text-[10px] font-[760] tracking-[.12em]",
            "px-6.25 py-0 text-[#798994]",
          )}
        >
          <span>Equipment details</span>
          <button
            className={cn(
              "grid h-8.25 w-8.25 place-items-center rounded-[7px] border-0 bg-transparent text-[#697680]",
              "hover:bg-[#e8eff5] hover:text-primary",
            )}
            aria-label="Close equipment details"
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6.25 py-6.25">
          <div
            className={cn(
              "border-b border-b-line pb-6.75",
              "[&_h2]:mt-2.25 [&_h2]:text-[24px] [&_h2]:tracking-[-.05em]",
              "[&_p]:mt-1.75 [&_p]:text-[11.5px] [&_p]:leading-[1.55] [&_p]:text-[#7e8e9a]",
            )}
          >
            <span className="mb-5.75 grid h-12.75 w-12.75 place-items-center rounded-[7px] bg-[#f1f4f5] text-[#405b69]">
              <Icon name={categoryIcon(item.category)} size={32} />
            </span>
            <span className="text-[9px] font-[780] tracking-[.16em] text-[#798994]">
              {item.id} Â· {item.category}
            </span>
            <h2>{item.name}</h2>
            <p>Tracked across store and staff custody.</p>
            <button
              className={cn(
                "inline-flex items-center gap-1.75 border-0 bg-transparent text-[11.5px] font-[720] text-[#304b5b]",
                "mt-3.5 px-0 py-0.5 whitespace-nowrap",
                "hover:text-[#37444d] hover:underline hover:underline-offset-4",
              )}
              onClick={onEdit}
            >
              Edit equipment <Icon name="arrow" size={15} />
            </button>
          </div>
          <div
            className={cn(
              "mx-0 my-6 grid grid-cols-[repeat(4,1fr)] gap-2",
              "[&>div]:rounded-[8px] [&>div]:border [&>div]:border-[#e3eaf0] [&>div]:bg-[#f6f9f6] [&>div]:px-2.25 [&>div]:py-3",
              "[&_span]:block [&_span]:text-[9px] [&_span]:text-[#8394a0]",
              "[&_strong]:mt-2 [&_strong]:block [&_strong]:text-[21px]",
            )}
          >
            <div>
              <span>Total held</span>
              <strong>{item.available + item.issued}</strong>
            </div>
            <div>
              <span>Available</span>
              <strong>{item.available}</strong>
            </div>
            <div>
              <span>Issued</span>
              <strong>{item.issued}</strong>
            </div>
            <div>
              <span>Faulty</span>
              <strong>{item.faulty}</strong>
            </div>
          </div>
          <div
            className={cn(
              "border-t border-t-line px-0 py-5",
              "[&_h3]:mb-3.75 [&_h3]:text-[13px]",
            )}
          >
            <h3>Stock position</h3>
            <div
              className={cn(
                "h-2 overflow-hidden rounded-[6px] bg-[#e3eaf0]",
                "[&_i]:block [&_i]:h-full [&_i]:rounded-[6px] [&_i]:bg-[#97aab8]",
              )}
            >
              <i
                style={{
                  width: `${item.available + item.issued ? (item.available / (item.available + item.issued)) * 100 : 0}%`,
                }}
              />
            </div>
            <div
              className={cn(
                "mt-2.5 flex gap-4.5 text-[10px] text-[#778691]",
                "[&_span]:flex [&_span]:items-center [&_span]:gap-1.5",
                "[&_i]:block [&_i]:h-1.75 [&_i]:w-1.75 [&_i]:rounded-[1px] [&_i]:bg-[#97aab8]",
                "[&_span:nth-child(2)_i]:bg-[#e3eaf0]",
              )}
            >
              <span>
                <i />
                Available
              </span>
              <span>
                <i />
                Issued
              </span>
            </div>
          </div>
          <div
            className={cn(
              "border-t border-t-line px-0 py-5",
              "[&_h3]:mb-3.75 [&_h3]:text-[13px]",
            )}
          >
            <h3>Details</h3>
            <div
              className={cn(
                "flex items-center justify-between border-b border-b-[#f0f3f0] px-0 py-2.75 text-[10.5px] text-[#7e8e9a]",
                "[&_strong]:font-[680] [&_strong]:text-[#42505b]",
                "last:border-0",
              )}
            >
              <span>Primary store</span>
              <strong>{item.location}</strong>
            </div>
            <div
              className={cn(
                "flex items-center justify-between border-b border-b-[#f0f3f0] px-0 py-2.75 text-[10.5px] text-[#7e8e9a]",
                "[&_strong]:font-[680] [&_strong]:text-[#42505b]",
                "last:border-0",
              )}
            >
              <span>Low-stock alert at</span>
              <strong>{item.reorder} units</strong>
            </div>
            <div
              className={cn(
                "flex items-center justify-between border-b border-b-[#f0f3f0] px-0 py-2.75 text-[10.5px] text-[#7e8e9a]",
                "[&_strong]:font-[680] [&_strong]:text-[#42505b]",
                "last:border-0",
              )}
            >
              <span>Stock status</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-[3px] px-2 py-1.25 text-[9.5px] font-bold whitespace-nowrap",
                  item.available <= item.reorder
                    ? "bg-[#fbf1e5] text-[#b27838]"
                    : "bg-[#edf3ef] text-[#3f725b]",
                )}
              >
                {item.available <= item.reorder ? "Low stock" : "Healthy"}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "border-t border-t-line px-0 py-5",
              "[&_h3]:mb-3.75 [&_h3]:text-[13px]",
            )}
          >
            <h3>Recent activity</h3>
            {movements.length ? (
              movements
                .slice(0, 3)
                .map((m) => <MovementRow key={m.id} movement={m} equipment={[item]} />)
            ) : (
              <p className="text-[#899aa7]">No movements recorded yet.</p>
            )}
          </div>
        </div>
        <div
          className={cn(
            "flex justify-end gap-2.25 border-t border-t-line bg-white px-6.25 py-4",
            "[&>button]:flex-1",
          )}
        >
          <Button onClick={onReceive} variant="secondary">
            Receive stock
          </Button>
          <Button onClick={onIssue} variant="primary">
            Issue equipment
          </Button>
        </div>
      </aside>
    </div>
  );
}
