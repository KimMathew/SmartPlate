import { Button } from "@/components/ui/button";

interface SaveCancelActionsProps {
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaveDisabled?: boolean;
}

export function SaveCancelActions({ onSave, onCancel, isSaveDisabled = false }: SaveCancelActionsProps) {
  return (
    <div className="flex gap-4 pt-2">
      <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-md" disabled={isSaveDisabled} onClick={onSave}>
        Save Changes
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
