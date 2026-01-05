import React from "react";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

function GridCard({ children, className = "col-span-1 row-span-1" }: Props) {
  return (
    <div
      className={` shadow-md w-full bg-muted/50 rounded-md p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default GridCard;
