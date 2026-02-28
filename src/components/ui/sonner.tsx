import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton: "group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-status-success" />,
        error: <AlertCircle className="h-4 w-4 text-destructive" />,
        info: <Info className="h-4 w-4 text-status-info" />,
        warning: <AlertTriangle className="h-4 w-4 text-status-warning" />,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
