"use client";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type ActionType = {
  label: string;
  icon?: LucideIcon;
} & ComponentPropsWithoutRef<typeof Button>;

type Props = {
  title: string;
  description?: string;
  actions?: ActionType[];
  showBack?: boolean;
};

function PageHeader({
  title,
  description,
  actions = [],
  showBack = false,
}: Props) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between w-full ">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button
            onClick={() => router.back()}
            variant={"outline"}
            size={"icon-lg"}
            className=" rounded-full"
          >
            <ArrowLeft />
          </Button>
        )}
        <div className="flex flex-col items-start ">
          <h3 className="font-semibold text-2xl">{title}</h3>
          <p className="text-muted-foreground font-normal">{description}</p>
        </div>
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
