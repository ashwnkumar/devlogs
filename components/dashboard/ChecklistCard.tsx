import { useGlobal } from "@/context/GlobalContext";
import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function ChecklistCard() {
  const { checklist } = useGlobal();
  const router = useRouter();
  const show = checklist.some((i) => i.status === false);

  const total = checklist.length;
  const done = checklist.filter(i => i.status).length

  if (!show) return;

  return (
    <Accordion type="single" collapsible className="my-4">
      <AccordionItem value="item-1">
        <AccordionTrigger className="bg-primary/20 text-primary font-semibold text-md px-4">
          Checklist ({done}/{total})
        </AccordionTrigger>
        <AccordionContent className=" px-4 py-3 rounded-lg bg-accent/50 h-full">
        <p className="font-semibold">Complete these steps to start using your app smoothly</p>
          {checklist.map((item, idx) => (
            <div
              onClick={() => {
                if (item.status) return;
                router.push(item.route);
              }}
              key={idx}
              className={`my-2 w-full flex items-center gap-2 ${item.status ? "cursor-default text-muted-foreground line-through" : "cursor-pointer"}`}
            >
              <Checkbox checked={item.status} id={String(idx)} />
              <p>{item.label}</p>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default ChecklistCard;
