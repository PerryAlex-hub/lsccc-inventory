import type { Equipment, Fault, InventoryState } from "../../lib/demo-data";
import type { FormKind, View } from "../../lib/workspace-config";

export type WorkspaceViewProps = {
  state: InventoryState;
  held: number;
  available: number;
  issued: number;
  faulty: number;
  lowStock: Equipment[];
  openFaults: Fault[];
  categories: string[];
  filteredEquipment: Equipment[];
  visibleEquipment: Equipment[];
  page: number;
  pageCount: number;
  query: string;
  category: string;
  stockFilter: string;
  setQuery: (query: string) => void;
  setCategory: (category: string) => void;
  setStockFilter: (stock: string) => void;
  setPage: (page: number) => void;
  navigate: (view: View) => void;
  setForm: (kind: FormKind) => void;
  setDetail: (id: string) => void;
  updateFault: (fault: Fault, status: Fault["status"]) => void;
};
