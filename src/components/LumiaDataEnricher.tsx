import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { StepIndicator } from "@/components/ui/step-indicator";
import { DataPreview } from "@/components/ui/data-preview";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Database, FileSpreadsheet, Zap } from "lucide-react";
import { 
  parseCSV, 
  normalizeFieldNames, 
  enrichData, 
  downloadEnrichedCSV,
  type MasterRecord,
  type WorkRecord,
  type EnrichedRecord
} from "@/utils/csvUtils";

export const LumiaDataEnricher = () => {
  const [masterFile, setMasterFile] = useState<File | null>(null);
  const [workFile, setWorkFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrichedData, setEnrichedData] = useState<EnrichedRecord[]>([]);
  const [matchedRecords, setMatchedRecords] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const { toast } = useToast();

  const steps = [
    {
      id: 1,
      title: "Upload do Banco Mestre",
      description: "Arquivo com dados completos (Nome, CPF, Email, Telefone)"
    },
    {
      id: 2,
      title: "Upload da Base de Trabalho",
      description: "Arquivo que será enriquecido (Nome e CPF)"
    },
    {
      id: 3,
      title: "Processar Dados",
      description: "Cruzamento e enriquecimento dos dados"
    },
    {
      id: 4,
      title: "Download dos Resultados",
      description: "Arquivo final enriquecido pronto para uso"
    }
  ];

  const handleMasterFileSelect = (file: File) => {
    setMasterFile(file);
    if (!completedSteps.includes(1)) {
      setCompletedSteps([...completedSteps, 1]);
    }
    setCurrentStep(2);
    toast({
      title: "Banco Mestre carregado",
      description: `Arquivo ${file.name} selecionado com sucesso.`,
    });
  };

  const handleWorkFileSelect = (file: File) => {
    setWorkFile(file);
    if (!completedSteps.includes(2)) {
      setCompletedSteps([...completedSteps, 2]);
    }
    setCurrentStep(3);
    toast({
      title: "Base de Trabalho carregada",
      description: `Arquivo ${file.name} selecionado com sucesso.`,
    });
  };

  const processData = async () => {
    if (!masterFile || !workFile) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione os dois arquivos antes de processar.",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Parse both CSV files
      const [masterData, workData] = await Promise.all([
        parseCSV(masterFile),
        parseCSV(workFile)
      ]);

      // Normalize field names
      const normalizedMasterData = normalizeFieldNames(masterData) as MasterRecord[];
      const normalizedWorkData = normalizeFieldNames(workData) as WorkRecord[];

      // Enrich the data
      const { enrichedData: result, matchedRecords: matches } = enrichData(
        normalizedMasterData,
        normalizedWorkData
      );

      setEnrichedData(result);
      setMatchedRecords(matches);
      
      if (!completedSteps.includes(3)) {
        setCompletedSteps([...completedSteps, 3]);
      }
      setCurrentStep(4);

      toast({
        title: "Processamento concluído",
        description: `${matches} de ${result.length} registros foram enriquecidos com sucesso.`,
      });

    } catch (error) {
      console.error('Error processing data:', error);
      toast({
        variant: "destructive",
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido ao processar os dados.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (enrichedData.length === 0) return;
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `dados_enriquecidos_${timestamp}.csv`;
    
    downloadEnrichedCSV(enrichedData, filename);
    
    if (!completedSteps.includes(4)) {
      setCompletedSteps([...completedSteps, 4]);
    }
    
    toast({
      title: "Download iniciado",
      description: `Arquivo ${filename} está sendo baixado.`,
    });
  };

  const reset = () => {
    setMasterFile(null);
    setWorkFile(null);
    setEnrichedData([]);
    setMatchedRecords(0);
    setCurrentStep(1);
    setCompletedSteps([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-lumia-gray-light/20 to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-lumia-blue to-lumia-blue-light rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-lumia-blue to-lumia-blue-light bg-clip-text text-transparent">
              Lumia Data Enricher
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enriqueça seus dados de forma inteligente e automatizada. 
            Faça o cruzamento entre suas bases e complete as informações em segundos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Indicator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StepIndicator 
                  steps={steps} 
                  currentStep={currentStep} 
                  completedSteps={completedSteps} 
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* File Upload Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    Etapa 1 - Banco Mestre
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    label="Banco Mestre"
                    description="Arquivo com dados completos (Nome, CPF, Email, Telefone)"
                    onFileSelect={handleMasterFileSelect}
                    file={masterFile}
                    onRemove={() => setMasterFile(null)}
                  />
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    Etapa 2 - Base de Trabalho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    label="Base de Trabalho"
                    description="Arquivo que será enriquecido (Nome e CPF)"
                    onFileSelect={handleWorkFileSelect}
                    file={workFile}
                    onRemove={() => setWorkFile(null)}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Process Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <Button
                    variant="lumia"
                    size="lg"
                    onClick={processData}
                    disabled={!masterFile || !workFile || isProcessing}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Processar Dados
                      </>
                    )}
                  </Button>
                  
                  {enrichedData.length > 0 && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={reset}
                      className="w-full sm:w-auto"
                    >
                      Novo Processamento
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {enrichedData.length > 0 && (
              <>
                <DataPreview 
                  data={enrichedData} 
                  totalProcessed={enrichedData.length}
                  matchedRecords={matchedRecords}
                />
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Button
                        variant="success"
                        size="lg"
                        onClick={handleDownload}
                        className="min-w-[200px]"
                      >
                        <Download className="w-4 h-4" />
                        Download CSV Enriquecido
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-primary">Lumia Intelligence</span>
          </p>
        </div>
      </div>
    </div>
  );
};