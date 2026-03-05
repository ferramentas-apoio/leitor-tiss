/**
 * Interfaces de dados extraidos de arquivos TISS.
 */

/** Procedimento executado dentro de uma guia TISS */
export interface Procedimento {
  readonly sequencialItem: string;
  readonly dataExecucao: string;
  readonly horaInicial: string;
  readonly horaFinal: string;
  readonly codigoTabela: string;
  readonly codigoProcedimento: string;
  readonly descricaoProcedimento: string;
  readonly quantidadeExecutada: string;
  readonly valorUnitario: string;
  readonly valorTotal: string;
}

/** Guia SP/SADT completa extraida do XML TISS */
export interface Guia {
  readonly guiaPrincipal: string;
  readonly numeroGuiaPrestador: string;
  readonly numeroGuiaOperadora: string;
  readonly numeroCarteira: string;
  readonly dataAutorizacao: string;
  readonly senha: string;
  readonly dataValidadeSenha: string;
  readonly nomeProfissional: string;
  readonly nomeContratadoSolicitante: string;
  readonly dataSolicitacao: string;
  readonly caraterAtendimento: string;
  readonly indicacaoClinica: string;
  readonly tipoAtendimento: string;
  readonly regimeAtendimento: string;
  readonly CNES: string;
  readonly valorTotalGeral: number;
  readonly procedimentos: readonly Procedimento[];
}

/** Resultado do processamento de um arquivo XML TISS */
export interface ResultadoImportacao {
  readonly guias: Guia[];
  readonly totalGeral: number;
  readonly totalGuias: number;
}
