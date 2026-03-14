import { Guia, Procedimento, ResultadoImportacao, DadosBeneficiario, Profissional, ValoresGuia } from '../types/guia.types';
import { TissVersaoConfig } from '../types/tiss-versao.types';
import { createLogger } from './logger.service';

const log = createLogger('XmlParser');

/**
 * Parser de arquivos XML no padrão TISS.
 * Utiliza DOMParser nativo do navegador para processar o XML
 * e extrai dados das guias SP/SADT com base no schema oficial da ANS.
 */
export class XmlParser {
  private readonly xpath: TissVersaoConfig['xpath'];

  constructor(config: TissVersaoConfig) {
    this.xpath = config.xpath;
    log.debug('XmlParser inicializado', { versao: config.nome });
  }

  /**
   * Faz o parse completo do XML e retorna todas as guias encontradas.
   */
  parse(xmlString: string): ResultadoImportacao {
    log.debug('Iniciando parse do XML', { tamanho: xmlString.length });

    const xml = this.parseXmlString(xmlString);
    const guiasElements = this.findElementsByLocalName(xml, this.xpath.guiaSP_SADT);

    log.info(`Encontradas ${guiasElements.length} guias`);

    // Buscar dados do cabecalho (transacao)
    const mensagemTiss = this.findElementsByLocalName(xml, 'mensagemTISS')[0];
    let sequencialTransacao = '';
    let dataRegistroTransacao = '';
    let horaRegistroTransacao = '';

    if (mensagemTiss) {
      const cabecalho = this.findElementsByLocalName(mensagemTiss, 'cabecalho')[0];
      if (cabecalho) {
        const identificacaoTransacao = this.findElementsByLocalName(cabecalho, 'identificacaoTransacao')[0];
        if (identificacaoTransacao) {
          sequencialTransacao = this.getText(identificacaoTransacao, this.xpath.sequencialTransacao);
          dataRegistroTransacao = this.getText(identificacaoTransacao, this.xpath.dataRegistroTransacao);
          horaRegistroTransacao = this.getText(identificacaoTransacao, this.xpath.horaRegistroTransacao);
        }
      }
    }

    const guias: Guia[] = guiasElements.map((el) => this.extrairGuia(el, {
      sequencialTransacao,
      dataRegistroTransacao,
      horaRegistroTransacao,
    }));

    const totalGeral = guias.reduce((sum, g) => sum + this.parseNumber(g.valores.valorTotalGeral), 0);

    log.info(`Parse concluido. Total guias: ${guias.length}, Total valor: ${totalGeral}`);

    return { guias, totalGeral, totalGuias: guias.length };
  }

  /**
   * Extrai a versao do padrao TISS de um XML.
   */
  extrairVersaoArquivo(xmlString: string): string {
    log.debug('Extraindo versao do arquivo');

    const xml = this.parseXmlString(xmlString);
    const elements = this.findElementsByLocalName(xml, this.xpath.padrao);

    if (elements.length > 0) {
      const content = elements[0].textContent?.trim() ?? '';
      log.info(`Versao encontrada: "${content}"`);
      return content;
    }

    log.warn('Elemento de versao nao encontrado no XML');
    return '';
  }

  /**
   * Converte uma string XML em um Document DOM.
   */
  private parseXmlString(xmlString: string): Document {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'text/xml');

    const parserError = xml.querySelector('parsererror');
    if (parserError) {
      log.warn('XML contém erros de parsing', {
        erro: parserError.textContent?.substring(0, 200),
      });
    }

    return xml;
  }

  /**
   * Extrai o localName de uma tag com prefixo de namespace.
   */
  private getLocalName(tagWithPrefix: string): string {
    const colonIndex = tagWithPrefix.indexOf(':');
    return colonIndex >= 0 ? tagWithPrefix.substring(colonIndex + 1) : tagWithPrefix;
  }

  /**
   * Busca todos os elementos com um determinado localName em um nó.
   */
  private findElementsByLocalName(
    parent: Document | Element,
    tagWithPrefix: string,
  ): Element[] {
    if (!tagWithPrefix) return [];

    const targetLocalName = this.getLocalName(tagWithPrefix);
    const allElements = parent.getElementsByTagName('*');
    const result: Element[] = [];

    for (let i = 0; i < allElements.length; i++) {
      if (allElements[i].localName === targetLocalName) {
        result.push(allElements[i]);
      }
    }

    return result;
  }

  /**
   * Extrai o texto de um elemento filho identificado pela tag.
   */
  private getText(element: Element, tagWithPrefix: string): string {
    if (!tagWithPrefix) return '';

    const targetLocalName = this.getLocalName(tagWithPrefix);
    const children = element.getElementsByTagName('*');

    for (let i = 0; i < children.length; i++) {
      if (children[i].localName === targetLocalName) {
        return children[i].textContent?.trim() ?? '';
      }
    }

    return '';
  }

  /**
   * Converte valor string para numero.
   */
  private parseNumber(value: string): number {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : 0;
  }

  /**
   * Extrai todos os dados de uma guia SP/SADT.
   * Baseado no schema oficial TISS 4.03.00 da ANS.
   */
  private extrairGuia(guiaElement: Element, dadosTransacao: {
    sequencialTransacao: string;
    dataRegistroTransacao: string;
    horaRegistroTransacao: string;
  }): Guia {
    // Cabecalho da Guia
    const cabecalhoGuia = this.findElementsByLocalName(guiaElement, 'cabecalhoGuia')[0];
    
    // Dados do Beneficiario
    const dadosBeneficiarioElement = this.findElementsByLocalName(guiaElement, 'dadosBeneficiario')[0];
    const dadosBeneficiario: DadosBeneficiario = {
      numeroCarteira: dadosBeneficiarioElement ? this.getText(dadosBeneficiarioElement, 'numeroCarteira') : '',
      atendimentoRN: dadosBeneficiarioElement ? this.getText(dadosBeneficiarioElement, 'atendimentoRN') : '',
    };

    // Dados do Solicitante
    const dadosSolicitanteElement = this.findElementsByLocalName(guiaElement, 'dadosSolicitante')[0];
    
    let profissionalSolicitante: Profissional = {
      nomeProfissional: '',
      codigoConselhoProfissional: '',
      numeroConselhoProfissional: '',
      UFConselho: '',
      CBO: '',
    };
    
    let codigoContratadoSolicitante = '';
    
    if (dadosSolicitanteElement) {
      const contratadoSolicitante = this.findElementsByLocalName(dadosSolicitanteElement, 'contratadoSolicitante')[0];
      if (contratadoSolicitante) {
        codigoContratadoSolicitante = this.getText(contratadoSolicitante, 'codigoPrestadorNaOperadora');
      }
      
      const profissionalSolicitanteElement = this.findElementsByLocalName(dadosSolicitanteElement, 'profissionalSolicitante')[0];
      if (profissionalSolicitanteElement) {
        profissionalSolicitante = {
          nomeProfissional: this.getText(profissionalSolicitanteElement, 'nomeProfissional'),
          codigoConselhoProfissional: this.getText(profissionalSolicitanteElement, 'conselhoProfissional'),
          numeroConselhoProfissional: this.getText(profissionalSolicitanteElement, 'numeroConselhoProfissional'),
          UFConselho: this.getText(profissionalSolicitanteElement, 'UF'),
          CBO: this.getText(profissionalSolicitanteElement, 'CBOS'),
        };
      }
    }

    // Dados da Solicitacao (esta no mesmo nivel de dadosSolicitante no schema)
    const dadosSolicitacaoElement = this.findElementsByLocalName(guiaElement, 'dadosSolicitacao')[0];

    // Dados do Executante
    const dadosExecutanteElement = this.findElementsByLocalName(guiaElement, 'dadosExecutante')[0];
    
    let codigoContratadoExecutante = '';
    let CNES = '';
    
    if (dadosExecutanteElement) {
      const contratadoExecutante = this.findElementsByLocalName(dadosExecutanteElement, 'contratadoExecutante')[0];
      if (contratadoExecutante) {
        codigoContratadoExecutante = this.getText(contratadoExecutante, 'codigoPrestadorNaOperadora');
      }
      CNES = this.getText(dadosExecutanteElement, 'CNES');
    }

    // Dados do Atendimento
    const dadosAtendimentoElement = this.findElementsByLocalName(guiaElement, 'dadosAtendimento')[0];

    // Dados da Autorizacao
    const dadosAutorizacaoElement = this.findElementsByLocalName(guiaElement, 'dadosAutorizacao')[0];

    // Valores da Guia - buscar o elemento que tem valorTotalGeral como filho
    // (evita confundir com valorTotal dos procedimentos individuais)
    const valorTotalElements = this.findElementsByLocalName(guiaElement, 'valorTotal');
    const valorTotalElement = valorTotalElements.find(el => 
      this.getText(el, 'valorTotalGeral') !== ''
    ) ?? null;
    const valores: ValoresGuia = {
      valorProcedimentos: valorTotalElement ? this.getText(valorTotalElement, 'valorProcedimentos') : '',
      valorDiarias: valorTotalElement ? this.getText(valorTotalElement, 'valorDiarias') : '',
      valorTaxasAlugueis: valorTotalElement ? this.getText(valorTotalElement, 'valorTaxasAlugueis') : '',
      valorMateriais: valorTotalElement ? this.getText(valorTotalElement, 'valorMateriais') : '',
      valorMedicamentos: valorTotalElement ? this.getText(valorTotalElement, 'valorMedicamentos') : '',
      valorTotalGeral: valorTotalElement ? this.getText(valorTotalElement, 'valorTotalGeral') : '',
    };

    const guia: Guia = {
      // Cabecalho da Transacao
      sequencialTransacao: dadosTransacao.sequencialTransacao,
      dataRegistroTransacao: dadosTransacao.dataRegistroTransacao,
      horaRegistroTransacao: dadosTransacao.horaRegistroTransacao,
      
      // Cabecalho da Guia
      guiaPrincipal: cabecalhoGuia ? this.getText(cabecalhoGuia, 'guiaPrincipal') : '',
      numeroGuiaPrestador: cabecalhoGuia ? this.getText(cabecalhoGuia, 'numeroGuiaPrestador') : '',
      registroANS: cabecalhoGuia ? this.getText(cabecalhoGuia, 'registroANS') : '',
      
      // Dados da Autorizacao
      numeroGuiaOperadora: dadosAutorizacaoElement ? this.getText(dadosAutorizacaoElement, 'numeroGuiaOperadora') : '',
      dataAutorizacao: dadosAutorizacaoElement ? this.getText(dadosAutorizacaoElement, 'dataAutorizacao') : '',
      senha: dadosAutorizacaoElement ? this.getText(dadosAutorizacaoElement, 'senha') : '',
      dataValidadeSenha: dadosAutorizacaoElement ? this.getText(dadosAutorizacaoElement, 'dataValidadeSenha') : '',
      
      // Dados do Beneficiario
      dadosBeneficiario,
      
      // Dados do Solicitante
      profissionalSolicitante,
      codigoContratadoSolicitante,
      nomeContratadoSolicitante: dadosSolicitanteElement ? this.getText(dadosSolicitanteElement, 'nomeContratadoSolicitante') : '',
      dataSolicitacao: dadosSolicitacaoElement ? this.getText(dadosSolicitacaoElement, 'dataSolicitacao') : '',
      caraterAtendimento: dadosSolicitacaoElement ? this.getText(dadosSolicitacaoElement, 'caraterAtendimento') : '',
      indicacaoClinica: dadosSolicitacaoElement ? this.getText(dadosSolicitacaoElement, 'indicacaoClinica') : '',
      
      // Dados do Executante
      codigoContratadoExecutante,
      CNES,
      
      // Dados do Atendimento
      tipoAtendimento: dadosAtendimentoElement ? this.getText(dadosAtendimentoElement, 'tipoAtendimento') : '',
      regimeAtendimento: dadosAtendimentoElement ? this.getText(dadosAtendimentoElement, 'regimeAtendimento') : '',
      tipoConsulta: dadosAtendimentoElement ? this.getText(dadosAtendimentoElement, 'tipoConsulta') : '',
      indicacaoAcidente: dadosAtendimentoElement ? this.getText(dadosAtendimentoElement, 'indicacaoAcidente') : '',
      observacao: this.getText(guiaElement, 'observacao'),
      
      // Valores
      valores,
      
      // Procedimentos
      procedimentos: this.extrairProcedimentos(guiaElement),
    };

    log.debug('Guia extraida', {
      guiaPrincipal: guia.guiaPrincipal,
      numeroCarteira: guia.dadosBeneficiario.numeroCarteira,
      valorTotalGeral: guia.valores.valorTotalGeral,
      procedimentos: guia.procedimentos.length,
    });

    return guia;
  }

  /**
   * Extrai todos os procedimentos executados de uma guia.
   */
  private extrairProcedimentos(guiaElement: Element): Procedimento[] {
    const procElements = this.findElementsByLocalName(
      guiaElement,
      this.xpath.procedimentoExecutado,
    );

    log.debug(`Encontrados ${procElements.length} procedimentos`);

    return procElements.map((proc) => ({
      sequencialItem: this.getText(proc, this.xpath.sequencialItem),
      dataExecucao: this.getText(proc, this.xpath.dataExecucao),
      horaInicial: this.getText(proc, this.xpath.horaInicial),
      horaFinal: this.getText(proc, this.xpath.horaFinal),
      codigoTabela: this.getText(proc, this.xpath.codigoTabela),
      codigoProcedimento: this.getText(proc, this.xpath.codigoProcedimento),
      descricaoProcedimento: this.getText(proc, this.xpath.descricaoProcedimento),
      quantidadeExecutada: this.getText(proc, this.xpath.quantidadeExecutada),
      valorUnitario: this.getText(proc, this.xpath.valorUnitario),
      valorTotal: this.getText(proc, this.xpath.valorTotal),
      reducaoAcrescimo: this.getText(proc, this.xpath.reducaoAcrescimo),
    }));
  }
}
