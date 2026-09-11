export type DiffAnnotation = {
  side?: "before" | "after";
  lines: string;
  label?: string;
  note: string;
};

export type FileTreeEntry = {
  path: string;
  change?: "added" | "modified" | "removed" | "renamed";
  note?: string;
  snippet?: string;
  language?: string;
};

export type ChecklistItem = {
  id: string;
  label: string;
  checked?: boolean;
  note?: string;
};

export type CalloutTone = "info" | "decision" | "risk" | "warning" | "success";
