import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CPFInputProps {
  onCPFListSubmit: (cpfs: string[]) => void;
  className?: string;
  label: string;
  description: string;
  cpfList?: string[];
  onRemove?: () => void;
}

export const CPFInput = ({
  onCPFListSubmit,
  className,
  label,
  description,
  cpfList,
  onRemove,
}: CPFInputProps) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = () => {
    const lines = inputText.split('\n');
    const cpfs = lines
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (cpfs.length > 0) {
      onCPFListSubmit(cpfs);
      setInputText("");
    }
  };

  if (cpfList && cpfList.length > 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="flex items-center justify-between p-4 border border-success rounded-lg bg-success/5">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <div className="font-medium text-foreground">
                {cpfList.length} CPFs carregados
              </div>
              <div className="text-sm text-muted-foreground">
                Lista de CPFs pronta para processamento
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
      <div className="space-y-4 border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          {description}
        </div>
        
        <Textarea
          placeholder="Cole aqui sua lista de CPFs (um por linha)&#10;Ex:&#10;123.456.789-00&#10;987.654.321-11&#10;555.444.333-22"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
        />
        
        <Button
          onClick={handleSubmit}
          disabled={!inputText.trim()}
          className="w-full"
        >
          Carregar CPFs
        </Button>
        
        <div className="text-xs text-muted-foreground text-center">
          Cole uma lista de CPFs, um por linha. Pontos e traços são opcionais.
        </div>
      </div>
    </div>
  );
};