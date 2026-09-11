import { Children, isValidElement, useState, type ReactElement, type ReactNode } from "react";

type TabProps = {
  id?: string;
  label: string;
  children: ReactNode;
};

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

type TabsProps = {
  orientation?: "horizontal" | "vertical";
  children: ReactNode;
};

function tabFromChild(child: ReactElement<TabProps>, index: number) {
  const id = child.props.id ?? `tab-${index}`;
  return {
    id,
    label: child.props.label,
    content: child.props.children,
  };
}

export function Tabs({ orientation = "horizontal", children }: TabsProps) {
  const tabs = Children.toArray(children)
    .filter(isValidElement)
    .map((child, index) => tabFromChild(child as ReactElement<TabProps>, index));

  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  if (tabs.length === 0) return null;

  return (
    <section className={`tabs tabs--${orientation}`}>
      <div className="tabs__list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={tab.id === active?.id ? "tabs__tab tabs__tab--active" : "tabs__tab"}
            aria-selected={tab.id === active?.id}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs__panel" role="tabpanel">
        {active?.content}
      </div>
    </section>
  );
}
