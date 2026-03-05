/**
 * Definicoes de tipos para o mapeamento de tags XML do padrao TISS.
 * Cada propriedade representa um elemento XML esperado no arquivo TISS.
 */
export interface TissXPath {
  readonly guiaSP_SADT: string;
  readonly cabecalhoGuia: string;
  readonly guiaPrincipal: string;
  readonly numeroGuiaPrestador: string;
  readonly dadosAutorizacao: string;
  readonly numeroGuiaOperadora: string;
  readonly dataAutorizacao: string;
  readonly senha: string;
  readonly dataValidadeSenha: string;
  readonly dadosBeneficiario: string;
  readonly numeroCarteira: string;
  readonly dadosSolicitante: string;
  readonly nomeContratadoSolicitante: string;
  readonly profissionalSolicitante: string;
  readonly nomeProfissional: string;
  readonly dadosSolicitacao: string;
  readonly dataSolicitacao: string;
  readonly caraterAtendimento: string;
  readonly indicacaoClinica: string;
  readonly dadosExecutante: string;
  readonly CNES: string;
  readonly dadosAtendimento: string;
  readonly tipoAtendimento: string;
  readonly regimeAtendimento: string;
  readonly procedimentosExecutados: string;
  readonly procedimentoExecutado: string;
  readonly sequencialItem: string;
  readonly dataExecucao: string;
  readonly horaInicial: string;
  readonly horaFinal: string;
  readonly procedimento: string;
  readonly codigoTabela: string;
  readonly codigoProcedimento: string;
  readonly descricaoProcedimento: string;
  readonly quantidadeExecutada: string;
  readonly valorUnitario: string;
  readonly valorTotal: string;
  readonly valorTotalGeral: string;
  readonly padrao: string;
}

/**
 * Configuracao de uma versao especifica do padrao TISS.
 */
export interface TissVersaoConfig {
  /** Nome amigavel da versao (ex: "TISS 4.02.00") */
  readonly nome: string;
  /** Namespace XML utilizado nesta versao */
  readonly namespace: string;
  /** Mapeamento de tags XML para esta versao */
  readonly xpath: TissXPath;
}

/**
 * Mapa de versoes TISS indexado pela string de versao (ex: "4.02.00").
 */
export interface TissVersoes {
  readonly [versao: string]: TissVersaoConfig;
}
