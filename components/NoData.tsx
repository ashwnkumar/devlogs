import React from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  title: string;
  description: string;
  icon?: LucideIcon;
  onClick?: () => void;
  actionText?: string;
  actionVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "ghost"
    | "link"
    | "secondary";
  className?: string;
};

function NoData({
  title,
  description,
  icon: Icon,
  onClick,
  actionText,
  actionVariant,
  className,
}: Props) {
  return (
    <Empty className={`w-full h-full border-2 border-dashed ${className}`}>
      <EmptyHeader>
        {Icon && (
          <EmptyMedia variant={"icon"}>
            <Icon />
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
        {(onClick || actionText) && (
          <EmptyContent>
            <Button variant={actionVariant} onClick={onClick}>
              {actionText}
            </Button>
          </EmptyContent>
        )}
      </EmptyHeader>
    </Empty>
  );
}

export default NoData;
