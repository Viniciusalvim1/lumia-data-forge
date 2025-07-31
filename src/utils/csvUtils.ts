import Papa from 'papaparse';

export interface MasterRecord {
  codigo?: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface WorkRecord {
  nome: string;
  cpf: string;
}

export interface EnrichedRecord {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
}

// Normalize CPF by removing dots, dashes, and spaces
export const normalizeCPF = (cpf: string): string => {
  if (!cpf) return '';
  return cpf.replace(/[\.\-\s]/g, '').trim();
};

// Parse CSV file
export const parseCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`Erro ao processar CSV: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Normalize field names to handle different formats
export const normalizeFieldNames = (data: any[]): any[] => {
  return data.map(row => {
    const normalizedRow: any = {};
    
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[-_]/g, '')
        .replace('cpfcnpj', 'cpf');
      
      normalizedRow[normalizedKey] = row[key];
    });
    
    return normalizedRow;
  });
};

// Process and enrich data
export const enrichData = (masterData: MasterRecord[], workData: WorkRecord[]): {
  enrichedData: EnrichedRecord[];
  matchedRecords: number;
} => {
  // Create a lookup map using normalized CPF
  const masterLookup = new Map<string, MasterRecord>();
  
  masterData.forEach(record => {
    const normalizedCPF = normalizeCPF(record.cpf);
    if (normalizedCPF) {
      masterLookup.set(normalizedCPF, record);
    }
  });

  let matchedRecords = 0;
  
  const enrichedData: EnrichedRecord[] = workData.map(workRecord => {
    const normalizedCPF = normalizeCPF(workRecord.cpf);
    const masterRecord = masterLookup.get(normalizedCPF);
    
    if (masterRecord) {
      matchedRecords++;
      return {
        nome: workRecord.nome,
        cpf: workRecord.cpf,
        email: masterRecord.email || '',
        telefone: masterRecord.telefone || ''
      };
    } else {
      return {
        nome: workRecord.nome,
        cpf: workRecord.cpf,
        email: '',
        telefone: ''
      };
    }
  });

  return { enrichedData, matchedRecords };
};

// Convert enriched data to CSV and download
export const downloadEnrichedCSV = (data: EnrichedRecord[], filename: string = 'dados_enriquecidos.csv') => {
  const csv = Papa.unparse(data, {
    header: true,
    delimiter: ';' // Use semicolon for Brazilian CSV format
  });
  
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // Add BOM for UTF-8
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};