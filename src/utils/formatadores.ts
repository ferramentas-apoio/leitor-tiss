/**
 * Formatadores de Dados
 * 
 * Funções puras para formatação de valores (moeda, data, números).
 * Seguem o padrão TISS e locale pt-BR.
 */

/**
 * Formata um valor numérico para moeda brasileira (Real).
 * 
 * @param valor - Valor numérico a ser formatado
 * @returns String formatada (ex: "1.234,56")
 * 
 * @example
 * formatarMoeda(1234.56); // "1.234,56"
 * formatarMoeda(0); // "0,00"
 */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata uma string de data no formato ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY).
 * 
 * @param dataStr - String de data no formato YYYY-MM-DD
 * @returns Data formatada ou string vazia se inválida
 * 
 * @example
 * formatarData('2024-03-15'); // "15/03/2024"
 * formatarData(''); // ""
 */
export function formatarData(dataStr: string): string {
  if (!dataStr || dataStr.length !== 10) return '';
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
}

/**
 * Formata string numérica TISS removendo zeros à esquerda
 * e decimais desnecessários.
 * 
 * @param valor - String numérica (ex: "00000001.00")
 * @returns Número formatado (ex: "1") ou string original se inválido
 * 
 * @example
 * formatarNumero('00000001.00'); // "1"
 * formatarNumero('1.50'); // "1.5"
 * formatarNumero(''); // ""
 */
export function formatarNumero(valor: string): string {
  if (!valor) return '';
  const num = parseFloat(valor);
  if (!Number.isFinite(num)) return valor;
  return Number.isInteger(num) ? String(num) : num.toString();
}

/**
 * Converte string de valor monetário TISS para número.
 * 
 * @param valor - String no formato TISS (ex: "00000115.72")
 * @returns Valor numérico ou 0 se inválido
 * 
 * @example
 * parseValorMonetario('00000115.72'); // 115.72
 * parseValorMonetario(''); // 0
 */
export function parseValorMonetario(valor: string): number {
  if (!valor) return 0;
  const num = parseFloat(valor);
  return Number.isFinite(num) ? num : 0;
}
