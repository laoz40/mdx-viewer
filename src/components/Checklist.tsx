import { useState } from "react";

import type { ChecklistItem } from "../types";

type ChecklistProps = {
  items: ChecklistItem[];
};

export function Checklist({ items }: ChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, Boolean(item.checked)])),
  );

  return (
    <ul className="checklist">
      {items.map((item) => (
        <li key={item.id} className="checklist__item">
          <label className="checklist__label">
            <input
              type="checkbox"
              checked={checked[item.id] ?? false}
              onChange={(event) =>
                setChecked((current) => ({
                  ...current,
                  [item.id]: event.target.checked,
                }))
              }
            />
            <span>{item.label}</span>
          </label>
          {item.note && <p className="checklist__note">{item.note}</p>}
        </li>
      ))}
    </ul>
  );
}
