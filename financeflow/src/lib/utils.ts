export function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

export function parseNumber(val: unknown): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = String(val).trim().replace(/[R$\s]/g, '');
  if (str === '') return 0;
  if (str.includes(',') && str.includes('.')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  return parseFloat(str) || 0;
}

export function formatDate(val: unknown): string | null {
  if (!val) return null;
  let strVal = String(val).trim();

  if (/^\d+(\.\d+)?$/.test(strVal)) {
    const num = parseFloat(strVal);
    if (num > 30000) {
      let dateJS = new Date((num - 25569) * 86400 * 1000);
      dateJS = new Date(dateJS.getTime() + dateJS.getTimezoneOffset() * 60000);
      const day = String(dateJS.getDate()).padStart(2, '0');
      const month = String(dateJS.getMonth() + 1).padStart(2, '0');
      const year = dateJS.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  const matchISO = strVal.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (matchISO) return `${matchISO[3]}/${matchISO[2]}/${matchISO[1]}`;

  const monthNames: Record<string, string> = {
    janeiro: '01', fevereiro: '02', março: '03', marco: '03',
    abril: '04', maio: '05', junho: '06', julho: '07',
    agosto: '08', setembro: '09', outubro: '10', novembro: '11', dezembro: '12',
  };
  const matchLong = strVal.match(/(\d{1,2})\s+de\s+([a-zA-ZçÇ]+)\s+de\s+(\d{4})/i);
  if (matchLong) {
    const day = matchLong[1].padStart(2, '0');
    const monthText = matchLong[2].toLowerCase();
    const year = matchLong[3];
    const monthNum = monthNames[monthText];
    if (monthNum) return `${day}/${monthNum}/${year}`;
  }

  const matchBR = strVal.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (matchBR) return `${matchBR[1]}/${matchBR[2]}/${matchBR[3]}`;

  if (strVal.length >= 10 && strVal.includes('/')) return strVal.substring(0, 10);
  return strVal;
}

export function brDateToISO(brDate: string): string {
  const parts = brDate.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return brDate;
}

export function classifyCategory(description: string): string {
  const upper = description.toUpperCase();
  if (/CEMIG|VIVO FIBRA|COPASA|CONDOMINIO|ALUGUEL|ENERGIA|AGUA/.test(upper))
    return '🏠 Moradia & Contas';
  if (/PADARIA|IFOOD|SUPERMERCADO|RESTAURANTE|PAO DE CASA|PIZZA|CERVEJA|MERCADO|LANCHE/.test(upper))
    return '🍔 Alimentação & Lazer';
  if (/BH TRANS|POSTO|UBER|99|JEEP|TAOS|ESTACIONAMENTO|MULTA|PEDAGIO/.test(upper))
    return '🚗 Transporte & Veículo';
  if (/CRUZEIRO DO SUL|ESCOLA|COLEGIO|JOAQUIM|JOACAO|JESUINA|MARIA VITORIA|FACULDADE/.test(upper))
    return '👶 Filhos, Babá & Educação';
  if (/AMAZON|MERCADO LIVRE|SHOPEE|NETFLIX|SPOTIFY|COMPRA/.test(upper))
    return '🛍️ Compras & Assinaturas';
  if (/NU PAGAMENTOS|FATURA|TRIBUTO|JUROS|IOF|EMPRESTIMO|TARIFA/.test(upper))
    return '💳 Financeiro & Cartões';
  if (/PIX ENVIADO|TED|DOC|TRANSF/.test(upper))
    return '🔄 Outros PIX e Transf.';
  return '📦 Outros Gastos';
}

export const CATEGORY_COLORS: Record<string, string> = {
  '🏠 Moradia & Contas': '#3b82f6',
  '🍔 Alimentação & Lazer': '#10b981',
  '🚗 Transporte & Veículo': '#f59e0b',
  '👶 Filhos, Babá & Educação': '#8b5cf6',
  '🛍️ Compras & Assinaturas': '#ec4899',
  '💳 Financeiro & Cartões': '#ef4444',
  '🔄 Outros PIX e Transf.': '#14b8a6',
  '📦 Outros Gastos': '#64748b',
  'Entrada/Rendimento': '#10b981',
  Moradia: '#3b82f6',
  Empregada: '#8b5cf6',
  'Cartão de Crédito': '#ef4444',
  Salário: '#10b981',
  Financiamento: '#f59e0b',
};

export const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

export const MONTH_NAME_TO_NUM: Record<string, string> = {
  jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
  jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
  janeiro: '01', fevereiro: '02', março: '03', marco: '03', maio: '05',
  junho: '06', julho: '07', agosto: '08', setembro: '09', outubro: '10',
  novembro: '11', dezembro: '12',
};

export function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
