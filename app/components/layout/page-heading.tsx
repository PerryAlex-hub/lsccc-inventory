import { cn } from "@/app/lib/cn";
import { Button } from "@/app/components/ui/button";
import { headings, type FormKind, type View } from "../../lib/workspace-config";
import { Icon } from "../ui/icons";

type Props = {
  view: View;
  setForm: (kind: FormKind) => void;
  exportInventory: () => void;
  exportMovements: () => void;
};

export function PageHeading({ view, setForm, exportInventory, exportMovements }: Props) {
  return (
    <div
      className={cn(
        "mb-7.5 flex items-end justify-between gap-6",
        "[&_h1]:text-[31px] [&_h1]:leading-[1.1] [&_h1]:font-[760] [&_h1]:tracking-[-.06em] [&_h1]:text-[#21292e]",
        "[&_p]:mt-1.75 [&_p]:text-[12.5px] [&_p]:leading-[1.5] [&_p]:text-[#73818c]",
        "max-[681px]:mb-5.75 max-[681px]:flex-col max-[681px]:items-start max-[681px]:gap-4.75",
        "max-[681px]:[&_h1]:text-[27px]",
        "max-[681px]:[&_p]:text-[11.5px]",
      )}
    >
      <div>
        <div className="mb-3 flex items-center gap-2.25 text-[9px] font-[780] tracking-[.16em] text-[#798994]">
          <span className="h-px w-4.5 bg-[#7d8d99]" />
          LSCCC OPERATIONS / {headings[view].title.toUpperCase()}
        </div>
        <h1>{headings[view].title}</h1>
        <p>{headings[view].description}</p>
      </div>
      <div
        className={cn(
          "flex flex-wrap items-center justify-end gap-2.25",
          "max-[681px]:w-full max-[681px]:justify-start",
          "max-[681px]:[&>button]:flex-1",
          "max-[391px]:gap-1.5",
        )}
      >
        {view === "overview" && (
          <>
            <Button onClick={() => setForm("receive")} variant="secondary">
              <Icon name="plus" size={17} />
              Receive stock
            </Button>
            <Button onClick={() => setForm("issue")} variant="primary">
              <Icon name="arrow" size={17} />
              Issue equipment
            </Button>
          </>
        )}
        {view === "inventory" && (
          <>
            <Button onClick={exportInventory} variant="secondary">
              <Icon name="download" size={17} />
              Export
            </Button>
            <Button onClick={() => setForm("equipment")} variant="primary">
              <Icon name="plus" size={17} />
              Add equipment
            </Button>
          </>
        )}
        {view === "receipts" && (
          <Button onClick={() => setForm("receive")} variant="primary">
            <Icon name="plus" size={17} />
            Receive stock
          </Button>
        )}
        {view === "issues" && (
          <>
            <Button onClick={() => setForm("issue")} variant="primary">
              <Icon name="plus" size={17} />
              Issue equipment
            </Button>
          </>
        )}
        {view === "maintenance" && (
          <Button onClick={() => setForm("fault")} variant="primary">
            <Icon name="plus" size={17} />
            Report a fault
          </Button>
        )}
        {view === "movements" && (
          <>
            <Button onClick={exportMovements} variant="secondary">
              <Icon name="download" size={17} />
              Export history
            </Button>
          </>
        )}
        {view === "reports" && (
          <Button onClick={exportInventory} variant="primary">
            <Icon name="download" size={17} />
            Download report
          </Button>
        )}
      </div>
    </div>
  );
}
