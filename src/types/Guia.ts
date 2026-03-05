/**
 * Interfaces de dados extraidos de arquivos TISS.
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
  
  // Campos adicionais
  readonly reducaoAcrescimo: string;
  readonly grauParticipacao: string;
  readonly viaAcesso: string;
  readonly tecnicaUtilizada: string;
}

/** Dados do profissional */
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
  readonly nomeBeneficiario: string;
  readonly CNS: string;
  readonly atendimentoRN: string;
}

/** Dados do contratado executante */
export interface ContratadoExecutante {
  readonly nomeContratadoExecutante: string;
  readonly codigoNaOperadoraExecutante: string;
}

/** Valores da guia */
export interface ValoresGuia {
  readonly valorTotalProcedimentos: string;
  readonly valorTotalTaxasAlugueis: string;
  readonly valorTotalMateriais: string;
  readonly valorTotalOPME: string;
  readonly valorTotalMedicamentos: string;
  readonly valorTotalGasesMedicinais: string;
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
  readonly numeroGuiaOperadora: string;
  
  // Dados do Beneficiario
  readonly dadosBeneficiario: DadosBeneficiario;
  
  // Dados da Autorizacao
  readonly dataAutorizacao: string;
  readonly senha: string;
  readonly dataValidadeSenha: string;
  
  // Dados do Solicitante
  readonly profissionalSolicitante: Profissional;
  readonly nomeContratadoSolicitante: string;
  readonly dataSolicitacao: string;
  readonly caraterAtendimento: string;
  readonly indicacaoClinica: string;
  
  // Dados do Executante
  readonly contratadoExecutante: ContratadoExecutante;
  readonly CNES: string;
  readonly profissionalExecutante: Profissional;
  
  // Dados do Atendimento
  readonly tipoAtendimento: string;
  readonly regimeAtendimento: string;
  readonly tipoConsulta: string;
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
