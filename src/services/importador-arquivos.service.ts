/**
 * Serviço de Importação de Arquivos
 * 
 * Responsável por ler, detectar encoding, validar versão TISS
 * e extrair dados de arquivos XML.
 */

import { Guia } from '../types/guia.types';
import { TISS_VERSOES, isVersaoSuportada } from '../config/versoes.config';
import { XmlParser } from './xml-parser.service';
import { createLogger } from './logger.service';
import { detectarEncoding, detectarVersaoTiss } from '../utils/validadores';

const log = createLogger('ImportadorArquivos');

/** Resultado da importação de um único arquivo */
export interface ResultadoArquivoImportado {
  readonly nomeArquivo: string;
  readonly versao: string;
  readonly guias: Guia[];
  readonly totalArquivo: number;
}

/** Resultado de erro na importação */
export interface ErroImportacao {
  readonly nomeArquivo: string;
  readonly motivo: string;
}

/** Resultado completo do processamento de lote */
export interface ResultadoLoteImportacao {
  readonly sucessos: ResultadoArquivoImportado[];
  readonly erros: ErroImportacao[];
  readonly totalGeral: number;
}

/** Progresso atual da importação */
export interface ProgressoImportacao {
  readonly percentual: number;
  readonly arquivoAtual: string;
  readonly indiceAtual: number;
  readonly totalArquivos: number;
}

/** Callback para atualização de progresso */
type CallbackProgresso = (progresso: ProgressoImportacao) => void;

/**
 * Serviço responsável pela importação de arquivos XML TISS.
 */
export class ServicoImportacaoArquivos {
  private callbackProgresso?: CallbackProgresso;

  /**
   * Define um callback para acompanhar o progresso da importação.
   * 
   * @param callback - Função chamada a cada arquivo processado
   */
  onProgresso(callback: CallbackProgresso): void {
    this.callbackProgresso = callback;
  }

  /**
   * Lê um arquivo como texto, detectando o encoding automaticamente.
   * 
   * @param arquivo - Arquivo a ser lido
   * @returns Conteúdo do arquivo como string
   * @throws Error se falhar a leitura
   */
  private async lerArquivo(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const encoding = detectarEncoding(buffer);
        const decoder = new TextDecoder(encoding);
        resolve(decoder.decode(buffer));
      };
      
      reader.onerror = () => {
        reject(new Error(`Falha ao ler arquivo: ${arquivo.name}`));
      };
      
      reader.readAsArrayBuffer(arquivo);
    });
  }

  /**
   * Processa um único arquivo XML TISS.
   * 
   * @param arquivo - Arquivo XML a ser processado
   * @returns Resultado da importação com guias e totais
   * @throws Error se versão não suportada ou XML inválido
   */
  private async processarArquivo(arquivo: File): Promise<ResultadoArquivoImportado> {
    log.info(`Processando arquivo: ${arquivo.name}`);
    
    const conteudo = await this.lerArquivo(arquivo);
    
    // Detecta versão TISS
    const versao = detectarVersaoTiss(conteudo);
    if (!versao) {
      throw new Error('Versão TISS não encontrada no arquivo');
    }
    
    log.debug(`Versão detectada: ${versao}`);
    
    // Valida versão suportada
    if (!isVersaoSuportada(versao)) {
      const versoesSuportadas = Object.keys(TISS_VERSOES).join(', ');
      throw new Error(`Versão "${versao}" não suportada. Suportadas: ${versoesSuportadas}`);
    }
    
    // Parse do XML
    const config = TISS_VERSOES[versao];
    const parser = new XmlParser(config);
    const resultado = parser.parse(conteudo);
    
    log.info(`Arquivo processado: ${arquivo.name} - ${resultado.guias.length} guias`);
    
    return {
      nomeArquivo: arquivo.name,
      versao,
      guias: resultado.guias,
      totalArquivo: resultado.totalGeral,
    };
  }

  /**
   * Importa um lote de arquivos XML TISS.
   * 
   * @param arquivos - Lista de arquivos a serem importados
   * @returns Resultado completo com sucessos e erros
   */
  async importarLote(arquivos: File[]): Promise<ResultadoLoteImportacao> {
    log.info(`Iniciando importação de ${arquivos.length} arquivo(s)`);
    
    const sucessos: ResultadoArquivoImportado[] = [];
    const erros: ErroImportacao[] = [];
    
    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i];
      const percentual = Math.round(((i + 1) / arquivos.length) * 100);
      
      // Notifica progresso
      if (this.callbackProgresso) {
        this.callbackProgresso({
          percentual,
          arquivoAtual: arquivo.name,
          indiceAtual: i + 1,
          totalArquivos: arquivos.length,
        });
      }
      
      try {
        const resultado = await this.processarArquivo(arquivo);
        
        if (resultado.guias.length === 0) {
          erros.push({
            nomeArquivo: arquivo.name,
            motivo: 'Nenhuma guia SP/SADT encontrada',
          });
          continue;
        }
        
        sucessos.push(resultado);
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : 'Erro desconhecido';
        log.error(`Erro ao processar ${arquivo.name}:`, { erro: mensagem });
        erros.push({
          nomeArquivo: arquivo.name,
          motivo: mensagem,
        });
      }
    }
    
    const totalGeral = sucessos.reduce((soma, item) => soma + item.totalArquivo, 0);
    
    log.info('Importação concluída', {
      sucessos: sucessos.length,
      erros: erros.length,
      totalGeral,
    });
    
    return {
      sucessos,
      erros,
      totalGeral,
    };
  }
}
