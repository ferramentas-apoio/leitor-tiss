/**
 * Controlador de Guias
 * 
 * Responsável por orquestrar a aplicação:
 * - Gerencia estado global (lotes, paginação, busca)
 * - Coordena eventos do usuário
 * - Integra services de importação e renderização
 * - Controla ciclo de vida da aplicação
 */

import { Guia } from '../types/guia.types';
import { createLogger } from '../services/logger.service';
import { ServicoImportacaoArquivos, ResultadoArquivoImportado, ProgressoImportacao } from '../services/importador-arquivos.service';
import { ServicoRenderizacao } from '../services/renderizador-view.service';
import { filtrarArquivosXml } from '../utils/validadores';
import { obterElementoPorId } from '../utils/dom';

const log = createLogger('ControladorGuias');

/** Interface mínima para o Bootstrap Modal */
interface ModalBootstrap {
  show(): void;
  hide(): void;
}

/** Interface mínima para o Bootstrap Toast */
interface ToastBootstrap {
  show(): void;
  hide(): void;
}

interface BootstrapStatic {
  Modal: {
    getOrCreateInstance(el: Element | null): ModalBootstrap;
  };
  Toast: {
    getOrCreateInstance(el: Element | null): ToastBootstrap;
  };
}

/**
 * Controlador principal da aplicação Leitor TISS.
 * Coordena todos os services e gerencia o estado global.
 */
export class ControladorGuias {
  // Estado
  private lotes: ResultadoArquivoImportado[] = [];
  private arquivoAtual = 0;
  private paginaAtual = 1;
  private termoBusca = '';
  private itensPorPagina = 20;
  private timeoutBusca: ReturnType<typeof setTimeout> | null = null;

  // Services
  private servicoImportacao: ServicoImportacaoArquivos;
  private servicoRenderizacao: ServicoRenderizacao;

  // Elementos DOM
  private elementos!: {
    fileInput: HTMLInputElement;
    importarBtn: HTMLButtonElement;
    fileName: HTMLElement;
    results: HTMLElement;
    uploadSection: HTMLElement;
    totalGuias: HTMLElement;
    valorTotalGeral: HTMLElement;
    valorTotalArquivo: HTMLElement;
    guiasTable: HTMLElement;
    pagination: HTMLElement;
    tabsContainer: HTMLElement;
    fileTabs: HTMLElement;
    nomeArquivo: HTMLElement;
    versaoBadge: HTMLElement;
    modalGuia: ModalBootstrap;
    modalErro: ModalBootstrap;
    modalImportacao: ModalBootstrap;
    versaoArquivo: HTMLElement;
    versaoSelecionadaEl: HTMLElement;
    importacaoContent: HTMLElement;
    clearBtn: HTMLButtonElement;
    dropZone: HTMLElement;
    searchInput: HTMLInputElement;
    emptyState: HTMLElement;
    loadingOverlay: HTMLElement;
    loadingText: HTMLElement;
    loadingProgress: HTMLElement;
    loadingDetail: HTMLElement;
    toastNotification: ToastBootstrap;
    toastBody: HTMLElement;
    itensPorPagina: HTMLSelectElement;
    totalProcedimentos: HTMLElement;
    totalQtdExecutada: HTMLElement;
    totalGeralSection: HTMLElement;
    totalGeralArquivos: HTMLElement;
    totalGuiasGeral: HTMLElement;
    totalProcedimentosGeral: HTMLElement;
    totalQtdExecutadaGeral: HTMLElement;
    colArquivo: HTMLElement;
  };

  constructor() {
    this.servicoImportacao = new ServicoImportacaoArquivos();
    this.servicoRenderizacao = new ServicoRenderizacao();
    
    // Configura callbacks dos services
    this.configurarCallbacks();
  }

  /**
   * Inicializa o controlador, obtendo referências do DOM
   * e configurando event listeners.
   */
  iniciar(): void {
    log.info('Iniciando ControladorGuias');
    
    this.inicializarElementos();
    this.configurarEventListeners();
  }

  /**
   * Obtém referências para todos os elementos DOM necessários.
   * @throws Error se algum elemento não for encontrado
   */
  private inicializarElementos(): void {
    const bs = (window as unknown as { bootstrap: BootstrapStatic }).bootstrap;

    this.elementos = {
      fileInput: obterElementoPorId<HTMLInputElement>('fileInput'),
      importarBtn: obterElementoPorId<HTMLButtonElement>('btnImportar'),
      fileName: obterElementoPorId<HTMLElement>('fileName'),
      results: obterElementoPorId<HTMLElement>('results'),
      uploadSection: obterElementoPorId<HTMLElement>('uploadSection'),
      totalGuias: obterElementoPorId<HTMLElement>('totalGuias'),
      valorTotalGeral: obterElementoPorId<HTMLElement>('valorTotalGeral'),
      valorTotalArquivo: obterElementoPorId<HTMLElement>('valorTotalArquivo'),
      nomeArquivo: obterElementoPorId<HTMLElement>('nomeArquivo'),
      versaoBadge: obterElementoPorId<HTMLElement>('versaoBadge'),
      guiasTable: obterElementoPorId<HTMLElement>('guiasTable'),
      pagination: obterElementoPorId<HTMLElement>('pagination'),
      tabsContainer: obterElementoPorId<HTMLElement>('tabsContainer'),
      fileTabs: obterElementoPorId<HTMLElement>('fileTabs'),
      modalGuia: bs.Modal.getOrCreateInstance(document.getElementById('modalGuia')),
      modalErro: bs.Modal.getOrCreateInstance(document.getElementById('modalErro')),
      modalImportacao: bs.Modal.getOrCreateInstance(document.getElementById('modalImportacao')),
      versaoArquivo: obterElementoPorId<HTMLElement>('versaoArquivo'),
      versaoSelecionadaEl: obterElementoPorId<HTMLElement>('versaoSelecionada'),
      importacaoContent: obterElementoPorId<HTMLElement>('importacaoContent'),
      clearBtn: obterElementoPorId<HTMLButtonElement>('clearBtn'),
      dropZone: obterElementoPorId<HTMLElement>('dropZone'),
      searchInput: obterElementoPorId<HTMLInputElement>('searchInput'),
      emptyState: obterElementoPorId<HTMLElement>('emptyState'),
      loadingOverlay: obterElementoPorId<HTMLElement>('loadingOverlay'),
      loadingText: obterElementoPorId<HTMLElement>('loadingText'),
      loadingProgress: obterElementoPorId<HTMLElement>('loadingProgress'),
      loadingDetail: obterElementoPorId<HTMLElement>('loadingDetail'),
      toastNotification: bs.Toast.getOrCreateInstance(document.getElementById('toastNotification')),
      toastBody: obterElementoPorId<HTMLElement>('toastBody'),
      itensPorPagina: obterElementoPorId<HTMLSelectElement>('itensPorPagina'),
      totalProcedimentos: obterElementoPorId<HTMLElement>('totalProcedimentos'),
      totalQtdExecutada: obterElementoPorId<HTMLElement>('totalQtdExecutada'),
      totalGeralSection: obterElementoPorId<HTMLElement>('totalGeralSection'),
      totalGeralArquivos: obterElementoPorId<HTMLElement>('totalGeralArquivos'),
      totalGuiasGeral: obterElementoPorId<HTMLElement>('totalGuiasGeral'),
      totalProcedimentosGeral: obterElementoPorId<HTMLElement>('totalProcedimentosGeral'),
      totalQtdExecutadaGeral: obterElementoPorId<HTMLElement>('totalQtdExecutadaGeral'),
      colArquivo: obterElementoPorId<HTMLElement>('colArquivo'),
    };

    log.debug('Elementos DOM inicializados');
  }

  /**
   * Configura os callbacks dos services.
   */
  private configurarCallbacks(): void {
    // Callback de progresso da importação
    this.servicoImportacao.onProgresso((progresso: ProgressoImportacao) => {
      this.atualizarLoading(progresso.percentual, 
        `${progresso.indiceAtual} de ${progresso.totalArquivos}: ${progresso.arquivoAtual}`);
    });

    // Callback para abrir modal de guia
    this.servicoRenderizacao.onAbrirModalGuia((indiceGuia, indiceArquivo) => {
      this.abrirModalGuia(indiceGuia, indiceArquivo);
    });

    // Callback para seleção de arquivo
    this.servicoRenderizacao.onSelecionarArquivo((indice) => {
      this.selecionarArquivo(indice);
    });

    // Callback para mudança de página
    this.servicoRenderizacao.onMudarPagina((pagina) => {
      this.mudarPagina(pagina);
    });
  }

  /**
   * Configura todos os event listeners.
   */
  private configurarEventListeners(): void {
    // Seleção de arquivo
    this.elementos.fileInput.addEventListener('change', () => this.onArquivosSelecionados());

    // Botões
    this.elementos.importarBtn.addEventListener('click', () => this.importarXml());
    this.elementos.clearBtn.addEventListener('click', () => this.limparDados());

    // Drag and drop
    const dz = this.elementos.dropZone;
    dz.addEventListener('dragover', (e) => {
      e.preventDefault();
      dz.classList.add('drag-over');
    });
    dz.addEventListener('dragleave', () => {
      dz.classList.remove('drag-over');
    });
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('drag-over');
      const dt = e.dataTransfer;
      if (dt?.files && dt.files.length > 0) {
        this.elementos.fileInput.files = dt.files;
        this.onArquivosSelecionados();
      }
    });

    // Busca com debounce
    this.elementos.searchInput.addEventListener('input', () => {
      if (this.timeoutBusca) clearTimeout(this.timeoutBusca);
      this.timeoutBusca = setTimeout(() => {
        this.termoBusca = this.elementos.searchInput.value.trim().toLowerCase();
        this.paginaAtual = 1;
        this.renderizarTabela();
        this.renderizarPaginacao();
      }, 250);
    });

    // Itens por página
    this.elementos.itensPorPagina.addEventListener('change', () => {
      this.itensPorPagina = parseInt(this.elementos.itensPorPagina.value, 10);
      this.paginaAtual = 1;
      this.renderizarTabela();
      this.renderizarPaginacao();
    });

    log.debug('Event listeners configurados');
  }

  /**
   * Handler para quando arquivos são selecionados.
   */
  private onArquivosSelecionados(): void {
    const files = this.elementos.fileInput.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      this.elementos.fileName.textContent = `Arquivo selecionado: ${files[0].name}`;
    } else {
      this.elementos.fileName.textContent = `${files.length} arquivos selecionados`;
    }
  }

  // ===========================================================================
  // Loading Overlay
  // ===========================================================================

  private mostrarLoading(texto: string): void {
    this.elementos.loadingText.textContent = texto;
    this.elementos.loadingProgress.style.width = '0%';
    this.elementos.loadingDetail.textContent = '';
    this.elementos.loadingOverlay.classList.remove('d-none');
  }

  private atualizarLoading(percentual: number, detalhe: string): void {
    this.elementos.loadingProgress.style.width = `${percentual}%`;
    this.elementos.loadingDetail.textContent = detalhe;
  }

  private ocultarLoading(): void {
    this.elementos.loadingOverlay.classList.add('d-none');
  }

  // ===========================================================================
  // Toast Notifications
  // ===========================================================================

  private mostrarToast(mensagem: string, tipo: 'success' | 'danger' | 'warning' | 'info'): void {
    const toastEl = document.getElementById('toastNotification') as HTMLElement;
    toastEl.className = `toast align-items-center border-0 text-bg-${tipo}`;
    this.elementos.toastBody.textContent = mensagem;
    this.elementos.toastNotification.show();
  }

  // ===========================================================================
  // Importação
  // ===========================================================================

  /**
   * Inicia o processo de importação de arquivos XML.
   */
  private async importarXml(): Promise<void> {
    const arquivos = this.elementos.fileInput.files;
    if (!arquivos || arquivos.length === 0) {
      this.mostrarToast('Selecione ao menos um arquivo XML.', 'warning');
      return;
    }

    const arquivosValidos = filtrarArquivosXml(arquivos);
    if (arquivosValidos.length === 0) {
      this.mostrarToast('Nenhum arquivo XML encontrado na seleção.', 'warning');
      return;
    }

    log.info(`Importando ${arquivosValidos.length} arquivo(s)`);
    this.mostrarLoading('Importando arquivos...');

    // Reseta estado
    this.lotes = [];
    this.arquivoAtual = 0;
    this.paginaAtual = 1;
    this.termoBusca = '';
    this.itensPorPagina = 20;
    this.elementos.searchInput.value = '';
    this.elementos.itensPorPagina.value = '20';

    // Importa lote
    const resultado = await this.servicoImportacao.importarLote(arquivosValidos);

    this.ocultarLoading();

    if (resultado.sucessos.length === 0) {
      this.mostrarErroImportacao(resultado.erros);
      return;
    }

    this.lotes = resultado.sucessos;

    // Atualiza UI
    this.elementos.clearBtn.classList.remove('d-none');
    this.elementos.uploadSection.classList.add('d-none');
    this.mostrarModalImportacao(resultado);
    this.renderizarResultados();

    const totalGuias = this.lotes.reduce((s, l) => s + l.guias.length, 0);
    this.mostrarToast(
      `${resultado.sucessos.length} arquivo(s) importado(s) — ${totalGuias} guias`,
      resultado.erros.length > 0 ? 'warning' : 'success'
    );
  }

  /**
   * Exibe modal de erro quando nenhum arquivo é importado.
   */
  private mostrarErroImportacao(erros: { nomeArquivo: string; motivo: string }[]): void {
    this.elementos.versaoArquivo.textContent = erros.length > 0
      ? erros.map(e => `${e.nomeArquivo}: ${e.motivo}`).join('; ')
      : 'Nenhum arquivo válido';
    this.elementos.modalErro.show();
  }

  /**
   * Exibe modal com resultado da importação.
   */
  private mostrarModalImportacao(resultado: {
    sucessos: ResultadoArquivoImportado[];
    erros: { nomeArquivo: string; motivo: string }[];
  }): void {
    const html = this.servicoRenderizacao.gerarHtmlModalImportacao(resultado.sucessos, resultado.erros);
    this.elementos.importacaoContent.innerHTML = html;
    this.elementos.modalImportacao.show();
  }

  // ===========================================================================
  // Limpar Dados
  // ===========================================================================

  /**
   * Limpa todos os dados e reseta o estado da aplicação.
   */
  private limparDados(): void {
    this.lotes = [];
    this.arquivoAtual = 0;
    this.paginaAtual = 1;
    this.termoBusca = '';
    this.itensPorPagina = 20;
    this.elementos.fileInput.value = '';
    this.elementos.fileName.textContent = '';
    this.elementos.searchInput.value = '';
    this.elementos.itensPorPagina.value = '20';
    this.elementos.results.classList.add('d-none');
    this.elementos.uploadSection.classList.remove('d-none');
    this.elementos.clearBtn.classList.add('d-none');
    this.mostrarToast('Dados limpos com sucesso.', 'info');
    
    log.info('Dados limpos');
  }

  // ===========================================================================
  // Renderização
  // ===========================================================================

  private renderizarResultados(): void {
    this.renderizarAbas();
    this.renderizarResumo();
    this.renderizarTabela();
    this.renderizarPaginacao();
    this.elementos.results.classList.remove('d-none');
  }

  private renderizarAbas(): void {
    this.servicoRenderizacao.renderizarAbas(
      this.elementos.tabsContainer,
      this.elementos.fileTabs,
      this.lotes,
      this.arquivoAtual
    );
  }

  private renderizarResumo(): void {
    const elementosResumo = {
      nomeArquivo: this.elementos.nomeArquivo,
      versaoBadge: this.elementos.versaoBadge,
      valorTotalArquivo: this.elementos.valorTotalArquivo,
      totalGuias: this.elementos.totalGuias,
      totalProcedimentos: this.elementos.totalProcedimentos,
      totalQtdExecutada: this.elementos.totalQtdExecutada,
      colArquivo: this.elementos.colArquivo,
      totalGeralSection: this.elementos.totalGeralSection,
      totalGeralArquivos: this.elementos.totalGeralArquivos,
      valorTotalGeral: this.elementos.valorTotalGeral,
      totalGuiasGeral: this.elementos.totalGuiasGeral,
      totalProcedimentosGeral: this.elementos.totalProcedimentosGeral,
      totalQtdExecutadaGeral: this.elementos.totalQtdExecutadaGeral,
    };

    this.servicoRenderizacao.renderizarResumo(
      elementosResumo,
      this.lotes[this.arquivoAtual],
      this.lotes
    );
  }

  private renderizarTabela(): void {
    const guias = this.guiasFiltrados;
    const guiasLote = this.lotes[this.arquivoAtual]?.guias ?? [];
    
    // Aplica paginação: pega apenas as guias da página atual
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    const guiasPagina = guias.slice(inicio, fim);

    this.servicoRenderizacao.renderizarTabelaGuias(
      this.elementos.guiasTable,
      this.elementos.emptyState,
      guiasPagina,
      guiasLote,
      this.arquivoAtual
    );
  }

  private renderizarPaginacao(): void {
    const totalPaginas = Math.ceil(this.guiasFiltrados.length / this.itensPorPagina);
    
    this.servicoRenderizacao.renderizarPaginacao(
      this.elementos.pagination,
      this.paginaAtual,
      totalPaginas
    );
  }

  // ===========================================================================
  // Ações do Usuário
  // ===========================================================================

  /**
   * Seleciona um arquivo específico para visualização.
   */
  private selecionarArquivo(indice: number): void {
    this.arquivoAtual = indice;
    this.paginaAtual = 1;
    this.renderizarResultados();
  }

  /**
   * Muda para uma página específica.
   */
  private mudarPagina(pagina: number): void {
    this.paginaAtual = pagina;
    this.renderizarTabela();
    this.renderizarPaginacao();
  }

  /**
   * Abre o modal com detalhes de uma guia específica.
   */
  private abrirModalGuia(indiceGuia: number, indiceArquivo: number): void {
    const lote = this.lotes[indiceArquivo];
    if (!lote) return;

    const guia = lote.guias[indiceGuia];
    if (!guia) return;

    const modalBody = document.getElementById('modalBody') as HTMLElement;
    modalBody.innerHTML = this.servicoRenderizacao.gerarHtmlModalGuia(guia, lote, indiceGuia);
    
    this.elementos.modalGuia.show();
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  /**
   * Retorna as guias do arquivo atual, filtradas pelo termo de busca.
   */
  private get guiasFiltrados(): Guia[] {
    const guias = this.lotes[this.arquivoAtual]?.guias ?? [];
    if (!this.termoBusca) return guias.slice();

    const termo = this.termoBusca.toLowerCase();
    return guias.filter(g =>
      g.guiaPrincipal.toLowerCase().includes(termo) ||
      g.numeroGuiaPrestador.toLowerCase().includes(termo) ||
      g.dadosBeneficiario.numeroCarteira.toLowerCase().includes(termo) ||
      g.profissionalSolicitante.nomeProfissional.toLowerCase().includes(termo) ||
      g.nomeContratadoSolicitante.toLowerCase().includes(termo) ||
      g.senha.toLowerCase().includes(termo) ||
      g.CNES.toLowerCase().includes(termo) ||
      g.procedimentos.some(p =>
        p.codigoProcedimento.toLowerCase().includes(termo) ||
        p.descricaoProcedimento.toLowerCase().includes(termo)
      )
    );
  }
}
