import { LucideIcon } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";
import { Button } from "./ui/button";

type ActionType = {
  label: string;
  icon?: LucideIcon;
} & ComponentPropsWithoutRef<typeof Button>;

type Props = {
  title: string;
  description?: string;
  actions?: ActionType[];
};

function PageHeader({ title, description, actions = [] }: Props) {
  return (
    <div className="flex items-center justify-between w-full border-b pb-2">
      <div className="flex flex-col items-start ">
        <h3 className="font-semibold text-2xl">{title}</h3>
        <p className="text-muted-foreground font-normal">{description}</p>
      </div>
      {actions.length > 0 && (
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <Button key={index} {...action}>
              {action.icon && <action.icon />}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
