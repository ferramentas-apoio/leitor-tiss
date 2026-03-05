import { Guia, Procedimento, ResultadoImportacao, DadosBeneficiario, Profissional, ContratadoExecutante, ValoresGuia } from '../types/Guia';
import { TissVersaoConfig } from '../types/TissVersao';
import { createLogger } from './Logger';

const log = createLogger('XmlParser');

/**
 * Parser de arquivos XML no padrao TISS.
 * Utiliza DOMParser nativo do navegador para processar o XML
 * e extrai dados das guias SP/SADT com base na configuracao de versao.
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

    const guias: Guia[] = guiasElements.map((el) => this.extrairGuia(el));
    const totalGeral = guias.reduce((sum, g) => sum + this.parseNumber(g.valores.valorTotalGeral), 0);

    log.info(`Parse concluido. Total guias: ${guias.length}, Total valor: ${totalGeral}`);

    return { guias, totalGeral, totalGuias: guias.length };
  }

  /**
   * Extrai a versao do padrao TISS de um XML.
   * Busca o elemento <ans:Padrao> e retorna seu conteudo textual.
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
   * Verifica se houve erro de parsing e loga warnings.
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
   * Ex: "ans:guiaSP-SADT" -> "guiaSP-SADT"
   */
  private getLocalName(tagWithPrefix: string): string {
    const colonIndex = tagWithPrefix.indexOf(':');
    return colonIndex >= 0 ? tagWithPrefix.substring(colonIndex + 1) : tagWithPrefix;
  }

  /**
   * Busca todos os elementos com um determinado localName em um nó.
   * Isso contorna problemas de namespace ao comparar apenas pelo nome local.
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
   * Retorna string vazia se a tag estiver vazia ou o elemento nao for encontrado.
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
   * Extrai um valor numerico de um elemento filho.
   * Retorna 0 se o valor nao puder ser convertido.
   */
  private parseNumber(value: string): number {
    const num = parseFloat(value);
    return Number.isFinite(num) ? num : 0;
  }

  /**
   * Extrai todos os dados de uma guia SP/SADT.
   */
  private extrairGuia(guiaElement: Element): Guia {
    // Dados do Beneficiario
    const dadosBeneficiario: DadosBeneficiario = {
      numeroCarteira: this.getText(guiaElement, this.xpath.numeroCarteira),
      nomeBeneficiario: this.getText(guiaElement, this.xpath.nomeBeneficiario),
      CNS: this.getText(guiaElement, this.xpath.CNS),
      atendimentoRN: this.getText(guiaElement, this.xpath.atendimentoRN),
    };

    // Profissional Solicitante
    const profissionalSolicitante: Profissional = {
      nomeProfissional: this.getText(guiaElement, this.xpath.nomeProfissional),
      codigoConselhoProfissional: this.getText(guiaElement, this.xpath.codigoConselhoProfissional),
      numeroConselhoProfissional: this.getText(guiaElement, this.xpath.numeroConselhoProfissional),
      UFConselho: this.getText(guiaElement, this.xpath.UFConselho),
      CBO: this.getText(guiaElement, this.xpath.CBO),
    };

    // Contratado Executante
    const contratadoExecutante: ContratadoExecutante = {
      nomeContratadoExecutante: this.getText(guiaElement, this.xpath.nomeContratadoExecutante),
      codigoNaOperadoraExecutante: this.getText(guiaElement, this.xpath.codigoNaOperadoraExecutante),
    };

    // Profissional Executante
    const profissionalExecutante: Profissional = {
      nomeProfissional: '', // Extraido separadamente se necessario
      codigoConselhoProfissional: '',
      numeroConselhoProfissional: '',
      UFConselho: '',
      CBO: '',
    };

    // Valores da Guia
    const valores: ValoresGuia = {
      valorTotalProcedimentos: this.getText(guiaElement, this.xpath.valorTotalProcedimentos),
      valorTotalTaxasAlugueis: this.getText(guiaElement, this.xpath.valorTotalTaxasAlugueis),
      valorTotalMateriais: this.getText(guiaElement, this.xpath.valorTotalMateriais),
      valorTotalOPME: this.getText(guiaElement, this.xpath.valorTotalOPME),
      valorTotalMedicamentos: this.getText(guiaElement, this.xpath.valorTotalMedicamentos),
      valorTotalGasesMedicinais: this.getText(guiaElement, this.xpath.valorTotalGasesMedicinais),
      valorTotalGeral: this.getText(guiaElement, this.xpath.valorTotalGeral),
    };

    const guia: Guia = {
      // Cabecalho da Transacao
      sequencialTransacao: this.getText(guiaElement, this.xpath.sequencialTransacao),
      dataRegistroTransacao: this.getText(guiaElement, this.xpath.dataRegistroTransacao),
      horaRegistroTransacao: this.getText(guiaElement, this.xpath.horaRegistroTransacao),
      
      // Cabecalho da Guia
      guiaPrincipal: this.getText(guiaElement, this.xpath.guiaPrincipal),
      numeroGuiaPrestador: this.getText(guiaElement, this.xpath.numeroGuiaPrestador),
      numeroGuiaOperadora: this.getText(guiaElement, this.xpath.numeroGuiaOperadora),
      
      // Dados do Beneficiario
      dadosBeneficiario,
      
      // Dados da Autorizacao
      dataAutorizacao: this.getText(guiaElement, this.xpath.dataAutorizacao),
      senha: this.getText(guiaElement, this.xpath.senha),
      dataValidadeSenha: this.getText(guiaElement, this.xpath.dataValidadeSenha),
      
      // Dados do Solicitante
      profissionalSolicitante,
      nomeContratadoSolicitante: this.getText(guiaElement, this.xpath.nomeContratadoSolicitante),
      dataSolicitacao: this.getText(guiaElement, this.xpath.dataSolicitacao),
      caraterAtendimento: this.getText(guiaElement, this.xpath.caraterAtendimento),
      indicacaoClinica: this.getText(guiaElement, this.xpath.indicacaoClinica),
      
      // Dados do Executante
      contratadoExecutante,
      CNES: this.getText(guiaElement, this.xpath.CNES),
      profissionalExecutante,
      
      // Dados do Atendimento
      tipoAtendimento: this.getText(guiaElement, this.xpath.tipoAtendimento),
      regimeAtendimento: this.getText(guiaElement, this.xpath.regimeAtendimento),
      tipoConsulta: this.getText(guiaElement, this.xpath.tipoConsulta),
      observacao: this.getText(guiaElement, this.xpath.observacao),
      
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
      grauParticipacao: this.getText(proc, this.xpath.grauParticipacao),
      viaAcesso: this.getText(proc, this.xpath.viaAcesso),
      tecnicaUtilizada: this.getText(proc, this.xpath.tecnicaUtilizada),
    }));
  }
}
