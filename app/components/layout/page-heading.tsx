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
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                LSCCC OPERATIONS / {headings[view].title.toUpperCase()}
              </div>
              <h1>{headings[view].title}</h1>
              <p>{headings[view].description}</p>
            </div>
            <div className="heading-actions">
              {view === "overview" && (
                <>
                  <button
                    className="button secondary"
                    onClick={() => setForm("receive")}
                  >
                    <Icon name="plus" size={17} />
                    Receive stock
                  </button>
                  <button
                    className="button primary"
                    onClick={() => setForm("issue")}
                  >
                    <Icon name="arrow" size={17} />
                    Issue equipment
                  </button>
                </>
              )}
              {view === "inventory" && (
                <>
                  <button
                    className="button secondary"
                    onClick={exportInventory}
                  >
                    <Icon name="download" size={17} />
                    Export
                  </button>
                  <button
                    className="button primary"
                    onClick={() => setForm("equipment")}
                  >
                    <Icon name="plus" size={17} />
                    Add equipment
                  </button>
                </>
              )}
              {view === "receipts" && (
                <button
                  className="button primary"
                  onClick={() => setForm("receive")}
                >
                  <Icon name="plus" size={17} />
                  Receive stock
                </button>
              )}
              {view === "issues" && (
                <>
                  <button
                    className="button primary"
                    onClick={() => setForm("issue")}
                  >
                    <Icon name="plus" size={17} />
                    Issue equipment
                  </button>
                </>
              )}
              {view === "maintenance" && (
                <button
                  className="button primary"
                  onClick={() => setForm("fault")}
                >
                  <Icon name="plus" size={17} />
                  Report a fault
                </button>
              )}
              {view === "movements" && (
                <>
                  <button
                    className="button secondary"
                    onClick={exportMovements}
                  >
                    <Icon name="download" size={17} />
                    Export history
                  </button>
                </>
              )}
              {view === "reports" && (
                <button className="button primary" onClick={exportInventory}>
                  <Icon name="download" size={17} />
                  Download report
                </button>
              )}
            </div>
          </div>
  );
}

