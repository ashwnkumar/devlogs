import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Construction } from "lucide-react";

function ComingSoon() {
  return (
      <Empty className="w-full h-full bg-linear-to-b from-muted to-background ">
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <Construction />
          </EmptyMedia>
          <EmptyTitle>Coming Soon</EmptyTitle>
          <EmptyDescription>
            This part of the application is still under construction. Check back
            soon for updates!
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
  );
}

export default ComingSoon;
