/**
 * Definições de tipos para o mapeamento de tags XML do padrão TISS.
 * Cada propriedade representa um elemento XML esperado no arquivo TISS.
 */
export interface TissXPath {
  // Cabecalho da Transacao
  readonly sequencialTransacao: string;
  readonly dataRegistroTransacao: string;
  readonly horaRegistroTransacao: string;
  
  // Cabecalho da Guia
  readonly guiaSP_SADT: string;
  readonly cabecalhoGuia: string;
  readonly guiaPrincipal: string;
  readonly numeroGuiaPrestador: string;
  
  // Dados da Autorizacao
  readonly dadosAutorizacao: string;
  readonly numeroGuiaOperadora: string;
  readonly dataAutorizacao: string;
  readonly senha: string;
  readonly dataValidadeSenha: string;
  
  // Dados do Beneficiario
  readonly dadosBeneficiario: string;
  readonly numeroCarteira: string;
  readonly nomeBeneficiario: string;
  readonly CNS: string;
  readonly atendimentoRN: string;
  
  // Dados do Solicitante
  readonly dadosSolicitante: string;
  readonly nomeContratadoSolicitante: string;
  readonly profissionalSolicitante: string;
  readonly nomeProfissional: string;
  readonly codigoConselhoProfissional: string;
  readonly numeroConselhoProfissional: string;
  readonly UFConselho: string;
  readonly CBO: string;
  readonly dadosSolicitacao: string;
  readonly dataSolicitacao: string;
  readonly caraterAtendimento: string;
  readonly indicacaoClinica: string;
  
  // Dados do Executante
  readonly dadosExecutante: string;
  readonly CNES: string;
  
  // Dados do Atendimento
  readonly dadosAtendimento: string;
  readonly tipoAtendimento: string;
  readonly regimeAtendimento: string;
  readonly tipoConsulta: string;
  readonly observacao: string;
  
  // Valores
  readonly valorTotalProcedimentos: string;
  readonly valorTotalTaxasAlugueis: string;
  readonly valorTotalMateriais: string;
  readonly valorTotalMedicamentos: string;
  readonly valorTotalGeral: string;
  
  // Procedimentos
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
  readonly reducaoAcrescimo: string;
  
  // Padrao
  readonly padrao: string;
}

/**
 * Configuração de uma versão específica do padrão TISS.
 */
export interface TissVersaoConfig {
  /** Nome amigável da versão (ex: "TISS 4.02.00") */
  readonly nome: string;
  /** Namespace XML utilizado nesta versão */
  readonly namespace: string;
  /** Mapeamento de tags XML para esta versão */
  readonly xpath: TissXPath;
}

/**
 * Mapa de versões TISS indexado pela string de versão (ex: "4.02.00").
 */
export interface TissVersoes {
  readonly [versao: string]: TissVersaoConfig;
}
