import { Loader2 } from "lucide-react";
import React from "react";

interface LoaderProps {
  className?: string;
  size?: number | string;
}

export function Loader({ className = "mx-auto animate-spin text-emerald-500", size = 20 }: LoaderProps) {
  return <Loader2 className={className} style={{ width: size, height: size }} />;
}
