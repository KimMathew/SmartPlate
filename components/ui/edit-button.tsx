import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import React from "react";

interface EditButtonProps {
  onClick: () => void;
  className?: string;
}

export function EditButton({ onClick, className }: EditButtonProps) {
  return (
    <Button
      type="button"
      variant="default"
      className={`ml-4 mt-1 max-sm:text-xs ${className || ""}`}
      onClick={onClick}
    >
      <Pencil className="w-4 h-4 mr-2 max-sm:mr-0" />
      <span className="max-sm:hidden">Edit</span>
    </Button>
  );
}
