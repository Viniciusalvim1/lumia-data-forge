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
  cpf: string;
}

export interface EnrichedRecord {
  cpf: string;
  nome: string;
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
      transformHeader: (header: string) => {
        // Clean up header names
        return header.trim();
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
          // Filter out field count errors and only fail on serious parsing errors
          const criticalErrors = results.errors.filter(error => 
            error.type === 'Quotes' || 
            error.type === 'Delimiter' ||
            (error.type === 'FieldMismatch' && error.code === 'TooManyFields' && results.data.length === 0)
          );
          
          if (criticalErrors.length > 0) {
            reject(new Error(`Erro ao processar CSV: ${criticalErrors[0].message}`));
          } else {
            // Continue with data even if there are field mismatches
            resolve(results.data);
          }
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
  console.log('=== NORMALIZING FIELD NAMES ===');
  
  if (data.length === 0) return data;
  
  // First, let's examine the actual content to understand the structure
  const firstRow = data[0];
  console.log('First row content:', firstRow);
  
  // Create a mapping based on content analysis
  const fieldMapping: { [key: string]: string } = {};
  
  Object.keys(firstRow).forEach(key => {
    const value = firstRow[key];
    const valueStr = String(value).toLowerCase().trim();
    
    console.log(`Analyzing field "${key}" with value "${valueStr}"`);
    
    // Map based on header content
    if (valueStr.includes('cpf') || valueStr.includes('documento') || key === '3') {
      fieldMapping[key] = 'cpf';
      console.log(`Mapped "${key}" to "cpf"`);
    } else if (valueStr.includes('nome') || valueStr.includes('name') || key === '' || key === '0') {
      fieldMapping[key] = 'nome';
      console.log(`Mapped "${key}" to "nome"`);
    } else if (valueStr.includes('email') || valueStr.includes('e-mail') || key === '1') {
      fieldMapping[key] = 'email';
      console.log(`Mapped "${key}" to "email"`);
    } else if (valueStr.includes('telefone') || valueStr.includes('phone') || valueStr.includes('fone') || key === '2') {
      fieldMapping[key] = 'telefone';
      console.log(`Mapped "${key}" to "telefone"`);
    } else {
      // Keep original key but normalized
      fieldMapping[key] = key.toLowerCase().replace(/\s+/g, '').replace(/[-_]/g, '');
    }
  });
  
  console.log('Final field mapping:', fieldMapping);
  
  return data.slice(1).map((row, rowIndex) => { // Skip header row
    const normalizedRow: any = {};
    
    Object.keys(row).forEach(key => {
      const mappedKey = fieldMapping[key] || key;
      normalizedRow[mappedKey] = row[key];
    });
    
    if (rowIndex < 3) {
      console.log(`Sample normalized row ${rowIndex}:`, normalizedRow);
    }
    
    return normalizedRow;
  });
};

// Parse CPF list from text
export const parseCPFList = (text: string): WorkRecord[] => {
  const lines = text.split('\n');
  const cpfs: WorkRecord[] = [];
  
  lines.forEach(line => {
    const cleanLine = line.trim();
    if (cleanLine) {
      cpfs.push({ cpf: cleanLine });
    }
  });
  
  return cpfs;
};

// Process and enrich data
export const enrichData = (masterData: MasterRecord[], workData: WorkRecord[]): {
  enrichedData: EnrichedRecord[];
  matchedRecords: number;
} => {
  console.log('=== DEBUGGING ENRICHMENT PROCESS ===');
  console.log('Master data count:', masterData.length);
  console.log('Work data count:', workData.length);
  
  // Show sample master data
  if (masterData.length > 0) {
    console.log('Sample master record:', masterData[0]);
    console.log('Master CPF field:', masterData[0].cpf);
  }
  
  // Show sample work data
  if (workData.length > 0) {
    console.log('Sample work record:', workData[0]);
    console.log('Work CPF field:', workData[0].cpf);
  }

  // Create a lookup map using normalized CPF
  const masterLookup = new Map<string, MasterRecord>();
  
  masterData.forEach((record, index) => {
    const normalizedCPF = normalizeCPF(record.cpf);
    console.log(`Master record ${index}: original CPF = "${record.cpf}", normalized = "${normalizedCPF}"`);
    if (normalizedCPF) {
      masterLookup.set(normalizedCPF, record);
    }
  });

  console.log('Master lookup map size:', masterLookup.size);
  console.log('Master lookup keys:', Array.from(masterLookup.keys()).slice(0, 5));

  let matchedRecords = 0;
  
  const enrichedData: EnrichedRecord[] = workData.map((workRecord, index) => {
    const normalizedCPF = normalizeCPF(workRecord.cpf);
    console.log(`Work record ${index}: original CPF = "${workRecord.cpf}", normalized = "${normalizedCPF}"`);
    
    const masterRecord = masterLookup.get(normalizedCPF);
    console.log(`Match found for ${normalizedCPF}:`, !!masterRecord);
    
    if (masterRecord) {
      matchedRecords++;
      console.log(`✓ Match ${matchedRecords}: CPF ${normalizedCPF} found in master`);
      return {
        cpf: workRecord.cpf,
        nome: masterRecord.nome || '',
        email: masterRecord.email || '',
        telefone: masterRecord.telefone || ''
      };
    } else {
      console.log(`✗ No match: CPF ${normalizedCPF} not found in master`);
      return {
        cpf: workRecord.cpf,
        nome: '',
        email: '',
        telefone: ''
      };
    }
  });

  console.log(`=== ENRICHMENT COMPLETE ===`);
  console.log(`Total matches: ${matchedRecords} out of ${workData.length}`);
  
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