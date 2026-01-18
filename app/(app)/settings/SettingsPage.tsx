"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import GeneralSettings from "./GeneralSettings";
import ProfileSettings from "./ProfileSettings";
import AppearanceSettings from "./AppearanceSettings";

const tabsData = [
  { label: "Profile", key: "profile" },
  { label: "General", key: "general" },
];

function SettingsPage() {
  const params = useSearchParams();
  const tab = params.get("tab");

  const activeTab = tabsData.find((t) => t.key === tab)?.key ?? "profile";

  const renderSettings = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "profile":
        return <ProfileSettings />;

      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-2 h-full">
      <div className="w-56 border-r h-full flex flex-col gap-2 p-2">
        {tabsData.map((item, idx) => (
          <Link
            key={idx}
            href={`/settings?tab=${item.key}`}
            className={`px-4 py-2 rounded ${
              activeTab === item.key
                ? "bg-primary/5 border-l-6 border-primary"
                : "hover:bg-foreground/10"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="p-4 w-full h-full ">{renderSettings()}</div>
    </div>
  );
}

export default SettingsPage;
