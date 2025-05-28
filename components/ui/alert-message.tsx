import React from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

interface AlertMessageProps {
  type: "error" | "success" | "warning";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function AlertMessage({ type, title, message, onClose, className = "" }: AlertMessageProps) {
  const getAlertStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className={`rounded-md border p-4 ${getAlertStyles()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
