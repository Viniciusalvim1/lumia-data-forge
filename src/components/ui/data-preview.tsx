import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnrichedData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
}

interface DataPreviewProps {
  data: EnrichedData[];
  totalProcessed: number;
  matchedRecords: number;
}

export const DataPreview = ({ data, totalProcessed, matchedRecords }: DataPreviewProps) => {
  const previewData = data.slice(0, 5); // Show first 5 records
  const matchRate = totalProcessed > 0 ? (matchedRecords / totalProcessed * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Registros</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{totalProcessed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registros Enriquecidos</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success">{matchedRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Match</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-foreground">{matchRate}%</div>
              <Badge variant={Number(matchRate) > 50 ? "default" : "secondary"}>
                {Number(matchRate) > 50 ? "Alto" : "Baixo"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Preview dos Resultados</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mostrando os primeiros 5 registros de {totalProcessed} processados
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">CPF</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.nome}</TableCell>
                    <TableCell className="font-mono text-sm">{row.cpf}</TableCell>
                    <TableCell className={row.email ? "text-foreground" : "text-muted-foreground italic"}>
                      {row.email || "Não encontrado"}
                    </TableCell>
                    <TableCell className={row.telefone ? "text-foreground" : "text-muted-foreground italic"}>
                      {row.telefone || "Não encontrado"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};