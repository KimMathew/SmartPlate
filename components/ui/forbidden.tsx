import { Lock } from "lucide-react";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface ForbiddenProps {
  message?: string;
  actionHref?: string;
  actionText?: string;
}

const Forbidden: React.FC<ForbiddenProps> = ({
  message = "Access Forbidden: You do not have permission to view this page.",
  actionHref = "/",
  actionText = "Go Home",
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-muted/50 z-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center gap-2">
          <div className="bg-emerald-100 rounded-full p-3 mb-2">
            <Lock className="text-emerald-500 w-8 h-8" />
          </div>
          <CardTitle className="text-4xl font-extrabold text-emerald-600">
            403
          </CardTitle>
          <span className="text-lg font-semibold text-gray-800">Forbidden</span>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-center text-base mb-4 text-gray-600">
            {message}
          </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-center">
          <a
            href={actionHref}
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors duration-150"
          >
            {actionText}
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Forbidden;
