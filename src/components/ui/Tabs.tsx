interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div
      role="tablist"
      className="flex border-b border-border gap-0"
      aria-label="Tabs"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={[
              "min-h-[44px] px-5 py-2 text-sm font-medium",
              "border-b-2 transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deepGreen focus-visible:ring-inset",
              isActive
                ? "border-deepGreen text-deepGreen"
                : "border-transparent text-soilBrown hover:text-ink hover:border-border",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
