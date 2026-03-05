/**
 * Interfaces de dados extraidos de arquivos TISS.
 * Baseado no schema oficial TISS 4.03.00 da ANS
 */

/** Procedimento executado dentro de uma guia TISS */
export interface Procedimento {
  // Identificacao
  readonly sequencialItem: string;
  readonly dataExecucao: string;
  readonly horaInicial: string;
  readonly horaFinal: string;
  
  // Procedimento
  readonly codigoTabela: string;
  readonly codigoProcedimento: string;
  readonly descricaoProcedimento: string;
  
  // Quantidade e valores
  readonly quantidadeExecutada: string;
  readonly valorUnitario: string;
  readonly valorTotal: string;
  
  // Campo adicional do procedimento
  readonly reducaoAcrescimo: string;
}

/** Dados do profissional (solicitante ou executante) */
export interface Profissional {
  readonly nomeProfissional: string;
  readonly codigoConselhoProfissional: string;
  readonly numeroConselhoProfissional: string;
  readonly UFConselho: string;
  readonly CBO: string;
}

/** Dados do beneficiario */
export interface DadosBeneficiario {
  readonly numeroCarteira: string;
  readonly atendimentoRN: string;
}

/** Valores da guia */
export interface ValoresGuia {
  readonly valorProcedimentos: string;
  readonly valorDiarias: string;
  readonly valorTaxasAlugueis: string;
  readonly valorMateriais: string;
  readonly valorMedicamentos: string;
  readonly valorTotalGeral: string;
}

/** Dados do cabecalho da transacao */
export interface CabecalhoTransacao {
  readonly sequencialTransacao: string;
  readonly dataRegistroTransacao: string;
  readonly horaRegistroTransacao: string;
}

/** Guia SP/SADT completa extraida do XML TISS */
export interface Guia {
  // Cabecalho da Transacao
  readonly sequencialTransacao: string;
  readonly dataRegistroTransacao: string;
  readonly horaRegistroTransacao: string;
  
  // Cabecalho da Guia
  readonly guiaPrincipal: string;
  readonly numeroGuiaPrestador: string;
  readonly registroANS: string;
  
  // Dados da Autorizacao
  readonly numeroGuiaOperadora: string;
  readonly dataAutorizacao: string;
  readonly senha: string;
  readonly dataValidadeSenha: string;
  
  // Dados do Beneficiario
  readonly dadosBeneficiario: DadosBeneficiario;
  
  // Dados do Solicitante
  readonly profissionalSolicitante: Profissional;
  readonly codigoContratadoSolicitante: string;
  readonly nomeContratadoSolicitante: string;
  readonly dataSolicitacao: string;
  readonly caraterAtendimento: string;
  readonly indicacaoClinica: string;
  
  // Dados do Executante
  readonly codigoContratadoExecutante: string;
  readonly CNES: string;
  
  // Dados do Atendimento
  readonly tipoAtendimento: string;
  readonly regimeAtendimento: string;
  readonly tipoConsulta: string;
  readonly indicacaoAcidente: string;
  readonly observacao: string;
  
  // Valores
  readonly valores: ValoresGuia;
  
  // Procedimentos
  readonly procedimentos: readonly Procedimento[];
}

/** Resultado do processamento de um arquivo XML TISS */
export interface ResultadoImportacao {
  readonly guias: Guia[];
  readonly totalGeral: number;
  readonly totalGuias: number;
}
