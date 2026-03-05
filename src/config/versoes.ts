import { TissVersoes, TissXPath } from '../types/TissVersao';

/**
 * Configuracao completa de XPath compartilhada entre todas as versoes TISS 4.x.
 * Todos os elementos seguem o padrao de namespace "ans:" da ANS.
 *
 * Conforme o XSD oficial da ANS (tissComplexTypesV4_XX_XX.xsd), o campo
 * descricaoProcedimento e OBRIGATORIO dentro de ct_procedimentoDados
 * (procedimentoExecutado > procedimento > descricaoProcedimento) em TODAS
 * as versoes 4.x. Arquivos que nao incluem este campo sao nao-conformes
 * com o schema oficial - o sistema trata graciosamente retornando string vazia.
 */
const xpathCompleto: Omit<TissXPath, 'guiaSP_SADT'> = {
  // Cabecalho da Transacao
  sequencialTransacao: 'ans:sequencialTransacao',
  dataRegistroTransacao: 'ans:dataRegistroTransacao',
  horaRegistroTransacao: 'ans:horaRegistroTransacao',
  
  // Cabecalho da Guia
  cabecalhoGuia: 'ans:cabecalhoGuia',
  guiaPrincipal: 'ans:guiaPrincipal',
  numeroGuiaPrestador: 'ans:numeroGuiaPrestador',
  
  // Dados da Autorizacao
  dadosAutorizacao: 'ans:dadosAutorizacao',
  numeroGuiaOperadora: 'ans:numeroGuiaOperadora',
  dataAutorizacao: 'ans:dataAutorizacao',
  senha: 'ans:senha',
  dataValidadeSenha: 'ans:dataValidadeSenha',
  
  // Dados do Beneficiario
  dadosBeneficiario: 'ans:dadosBeneficiario',
  numeroCarteira: 'ans:numeroCarteira',
  nomeBeneficiario: 'ans:nomeBeneficiario',
  CNS: 'ans:CNS',
  atendimentoRN: 'ans:atendimentoRN',
  
  // Dados do Solicitante
  dadosSolicitante: 'ans:dadosSolicitante',
  nomeContratadoSolicitante: 'ans:nomeContratadoSolicitante',
  profissionalSolicitante: 'ans:profissionalSolicitante',
  nomeProfissional: 'ans:nomeProfissional',
  codigoConselhoProfissional: 'ans:codigoConselhoProfissional',
  numeroConselhoProfissional: 'ans:numeroConselhoProfissional',
  UFConselho: 'ans:UFConselho',
  CBO: 'ans:CBO',
  dadosSolicitacao: 'ans:dadosSolicitacao',
  dataSolicitacao: 'ans:dataSolicitacao',
  caraterAtendimento: 'ans:caraterAtendimento',
  indicacaoClinica: 'ans:indicacaoClinica',
  
  // Dados do Executante
  dadosExecutante: 'ans:dadosExecutante',
  nomeContratadoExecutante: 'ans:nomeContratadoExecutante',
  codigoNaOperadoraExecutante: 'ans:codigoNaOperadoraExecutante',
  CNES: 'ans:CNES',
  profissionalExecutante: 'ans:profissionalExecutante',
  
  // Dados do Atendimento
  dadosAtendimento: 'ans:dadosAtendimento',
  tipoAtendimento: 'ans:tipoAtendimento',
  regimeAtendimento: 'ans:regimeAtendimento',
  tipoConsulta: 'ans:tipoConsulta',
  observacao: 'ans:observacao',
  
  // Valores
  valorTotalProcedimentos: 'ans:valorTotalProcedimentos',
  valorTotalTaxasAlugueis: 'ans:valorTotalTaxasAlugueis',
  valorTotalMateriais: 'ans:valorTotalMateriais',
  valorTotalOPME: 'ans:valorTotalOPME',
  valorTotalMedicamentos: 'ans:valorTotalMedicamentos',
  valorTotalGasesMedicinais: 'ans:valorTotalGasesMedicinais',
  valorTotalGeral: 'ans:valorTotalGeral',
  
  // Procedimentos
  procedimentosExecutados: 'ans:procedimentosExecutados',
  procedimentoExecutado: 'ans:procedimentoExecutado',
  sequencialItem: 'ans:sequencialItem',
  dataExecucao: 'ans:dataExecucao',
  horaInicial: 'ans:horaInicial',
  horaFinal: 'ans:horaFinal',
  procedimento: 'ans:procedimento',
  codigoTabela: 'ans:codigoTabela',
  codigoProcedimento: 'ans:codigoProcedimento',
  descricaoProcedimento: 'ans:descricaoProcedimento',
  quantidadeExecutada: 'ans:quantidadeExecutada',
  valorUnitario: 'ans:valorUnitario',
  valorTotal: 'ans:valorTotal',
  reducaoAcrescimo: 'ans:reducaoAcrescimo',
  grauParticipacao: 'ans:grauParticipacao',
  viaAcesso: 'ans:viaAcesso',
  tecnicaUtilizada: 'ans:tecnicaUtilizada',
  
  // Padrao
  padrao: 'ans:Padrao',
};

/** Namespace padrao da ANS utilizado em todas as versoes TISS 4.x */
const TISS_NAMESPACE = 'http://www.ans.gov.br/padroes/tiss/schemas';

/**
 * XPath completo incluindo guiaSP_SADT, identico em todas as versoes 4.x.
 * Todas as versoes compartilham exatamente o mesmo schema de tags XML
 * para guias SP/SADT - a unica variacao real e se o prestador/operadora
 * opta por preencher campos opcionais como descricaoProcedimento.
 */
const xpathTiss4: TissXPath = {
  ...xpathCompleto,
  guiaSP_SADT: 'ans:guiaSP-SADT',
};

/**
 * Mapa de todas as versoes TISS 4.x suportadas pelo sistema.
 *
 * Versoes do componente de Comunicacao conforme historico oficial da ANS:
 * - 4.00.00: Publicada em jul/2021 (versao inicial da serie 4)
 * - 4.00.01: Publicada em nov/2021 (correcao da 4.00.00)
 * - 4.01.00: Publicada em set/2022 (atualizacao intermediaria)
 * - 4.02.00: Publicada em mai/2025 (inclui descricaoProcedimento como padrao)
 * - 4.03.00: Publicada em nov/2025 (versao vigente jan/2026)
 *
 * @see https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss
 */
export const TISS_VERSOES: TissVersoes = {
  '4.00.00': {
    nome: 'TISS 4.00.00',
    namespace: TISS_NAMESPACE,
    xpath: xpathTiss4,
  },
  '4.00.01': {
    nome: 'TISS 4.00.01',
    namespace: TISS_NAMESPACE,
    xpath: xpathTiss4,
  },
  '4.01.00': {
    nome: 'TISS 4.01.00',
    namespace: TISS_NAMESPACE,
    xpath: xpathTiss4,
  },
  '4.02.00': {
    nome: 'TISS 4.02.00',
    namespace: TISS_NAMESPACE,
    xpath: xpathTiss4,
  },
  '4.03.00': {
    nome: 'TISS 4.03.00',
    namespace: TISS_NAMESPACE,
    xpath: xpathTiss4,
  },
};

/** Versoes TISS suportadas como array somente leitura */
export const VERSOES_SUPORTADAS = Object.keys(TISS_VERSOES) as readonly string[];

/**
 * Retorna o nome amigavel de uma versao TISS.
 * Caso a versao nao seja encontrada, retorna o proprio valor informado.
 */
export function getVersaoTiss(versao: string | null): string {
  if (!versao) return 'Desconhecida';
  return TISS_VERSOES[versao]?.nome ?? versao;
}

/**
 * Retorna todas as versoes TISS suportadas.
 */
export function getTodasVersoes(): readonly string[] {
  return VERSOES_SUPORTADAS;
}

/**
 * Verifica se uma versao e suportada pelo sistema.
 */
export function isVersaoSuportada(versao: string): boolean {
  return versao in TISS_VERSOES;
}
