import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
  label: string;
  description: string;
  file?: File | null;
  onRemove?: () => void;
}

export const FileUpload = ({
  onFileSelect,
  accept = ".csv",
  className,
  label,
  description,
  file,
  onRemove,
}: FileUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
      setIsDragActive(false);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  if (file) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="flex items-center justify-between p-4 border border-success rounded-lg bg-success/5">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <div className="font-medium text-foreground">{file.name}</div>
              <div className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
          isDragActive
            ? "border-primary bg-primary/5 scale-105"
            : "border-border hover:border-primary hover:bg-primary/5",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">
              {isDragActive ? "Solte o arquivo aqui" : "Clique para selecionar ou arraste o arquivo"}
            </div>
            <div className="text-xs text-muted-foreground">{description}</div>
            <div className="text-xs text-muted-foreground">
              Formatos aceitos: CSV, XLS, XLSX
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};