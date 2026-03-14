/**
 * Validadores
 * 
 * Funções de validação para dados de entrada e arquivos.
 */

import { TISS_VERSOES } from '../config/versoes.config';

/**
 * Verifica se um arquivo é um XML válido pelo nome/extensão.
 * 
 * @param arquivo - Arquivo a ser validado
 * @returns true se for arquivo XML
 */
export function isArquivoXml(arquivo: File): boolean {
  return arquivo.name.toLowerCase().endsWith('.xml');
}

/**
 * Filtra uma lista de arquivos mantendo apenas os XML válidos.
 * 
 * @param arquivos - Lista de arquivos
 * @returns Array com apenas arquivos XML
 */
export function filtrarArquivosXml(arquivos: FileList | null): File[] {
  if (!arquivos) return [];
  return Array.from(arquivos).filter(isArquivoXml);
}

/**
 * Verifica se uma versão TISS é suportada pelo sistema.
 * 
 * @param versao - String da versão (ex: "4.03.00")
 * @returns true se a versão é suportada
 */
export function isVersaoSuportada(versao: string): boolean {
  return versao in TISS_VERSOES;
}

/**
 * Detecta o encoding declarado no prólogo XML a partir dos primeiros bytes.
 * Retorna 'iso-8859-1' como fallback, pois a maioria dos TISS usa ISO-8859-1.
 * 
 * @param buffer - ArrayBuffer com os primeiros bytes do arquivo
 * @returns Encoding detectado ou 'iso-8859-1' como padrão
 */
export function detectarEncoding(buffer: ArrayBuffer): string {
  const header = new TextDecoder('ascii').decode(buffer.slice(0, 200));
  const match = header.match(/encoding\s*=\s*["']([^"']+)["']/i);
  
  if (match) {
    const enc = match[1].trim().toLowerCase();
    if (enc === 'latin1' || enc === 'latin-1') return 'iso-8859-1';
    return enc;
  }
  
  return 'iso-8859-1';
}

/**
 * Detecta a versão TISS a partir da tag <ans:Padrao> ou <Padrao> no XML.
 * 
 * @param texto - Conteúdo do XML como string
 * @returns Versão detectada ou null se não encontrada
 */
export function detectarVersaoTiss(texto: string): string | null {
  const match = texto.match(/<(?:ans:)?Padrao>([^<]+)<\/(?:ans:)?Padrao>/);
  return match?.[1]?.trim() ?? null;
}
