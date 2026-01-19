import React, { ReactNode } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

type Props = {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    title: string,
    children: ReactNode 
}

function SheetComponent({
    open,
    onOpenChange,
    title,
    children
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle asChild>
            <h3 className="text-2xl">{title}</h3>
          </SheetTitle>
        </SheetHeader>
        <div className="w-full h-full flex flex-col items-center justify-start p-4 gap-4">
         {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default SheetComponent