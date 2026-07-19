import { useToast } from "@/components/ui/use-toast";

// Surfaces the real system error message via toast for any user-facing action.
export function useApiToast() {
  const { toast } = useToast();

  const toastSuccess = (title, description) =>
    toast({ title, description });

  const toastError = (e, title = "Something went wrong") => {
    const msg =
      e?.response?.data?.error ||
      e?.data?.error ||
      e?.message ||
      (typeof e === "string" ? e : "Unexpected error. Please try again.");
    toast({ title, description: msg, variant: "destructive" });
  };

  return { toast, toastSuccess, toastError };
}