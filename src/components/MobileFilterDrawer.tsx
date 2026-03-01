import { ReactNode, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface MobileFilterDrawerProps {
  title?: string;
  children: ReactNode;
}

export function MobileFilterDrawer({ title = "Filters & Info", children }: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden mb-4">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 w-full">
            <SlidersHorizontal className="h-4 w-4" />
            {title}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
