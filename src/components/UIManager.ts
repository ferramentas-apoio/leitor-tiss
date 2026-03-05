import { Guia } from '../types/Guia';
import { TISS_VERSOES, isVersaoSuportada } from '../config/versoes';
import { XmlParser } from '../services/XmlParser';
import { createLogger } from '../services/Logger';

const log = createLogger('UIManager');

/** Resultado de importação de um único arquivo */
export interface LoteArquivo {
  readonly nomeArquivo: string;
  readonly versao: string;
  readonly guias: Guia[];
  readonly totalArquivo: number;
}

/**
 * Escapa caracteres especiais HTML para prevenir XSS.
 * Deve ser usado para QUALQUER dado externo (nomes de arquivo, conteúdo XML)
 * antes de inseri-lo via innerHTML.
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Detecta o encoding declarado no prólogo XML a partir dos primeiros bytes.
 * Retorna 'iso-8859-1' como fallback, pois a maioria dos TISS usa ISO-8859-1.
 */
function detectarEncoding(buffer: ArrayBuffer): string {
  const header = new TextDecoder('ascii').decode(buffer.slice(0, 200));
  const match = header.match(/encoding\s*=\s*["']([^"']+)["']/i);
  if (match) {
    const enc = match[1].trim().toLowerCase();
    log.debug(`Encoding detectado no prólogo XML: ${enc}`);
    if (enc === 'latin1' || enc === 'latin-1') return 'iso-8859-1';
    return enc;
  }
  log.debug('Encoding não detectado no prólogo, usando iso-8859-1');
  return 'iso-8859-1';
}

/**
 * Detecta a versão TISS a partir da tag <ans:Padrao> ou <Padrao> no XML.
 */
function detectarVersao(texto: string): string | null {
  const match = texto.match(/<(?:ans:)?Padrao>([^<]+)<\/(?:ans:)?Padrao>/);
  return match?.[1]?.trim() ?? null;
}

/** Interface mínima para o Bootstrap Modal */
interface BootstrapModal {
  show(): void;
  hide(): void;
}

/** Interface mínima para o Bootstrap Toast */
interface BootstrapToast {
  show(): void;
  hide(): void;
}

interface BootstrapStatic {
  Modal: {
    getOrCreateInstance(el: Element | null): BootstrapModal;
  };
  Toast: {
    getOrCreateInstance(el: Element | null): BootstrapToast;
  };
}

export class UIManager {
  private lotes: LoteArquivo[] = [];
  private arquivoAtual = 0;
  private currentPage = 1;
  private searchTerm = '';
  private itemsPerPage = 20;

  private elements!: {
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
    modalGuia: BootstrapModal;
    modalErro: BootstrapModal;
    modalImportacao: BootstrapModal;
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
    toastNotification: BootstrapToast;
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

  init(): void {
    const bs = (window as unknown as { bootstrap: BootstrapStatic }).bootstrap;

    this.elements = {
      fileInput: document.getElementById('fileInput') as HTMLInputElement,
      importarBtn: document.getElementById('btnImportar') as HTMLButtonElement,
      fileName: document.getElementById('fileName') as HTMLElement,
      results: document.getElementById('results') as HTMLElement,
      uploadSection: document.getElementById('uploadSection') as HTMLElement,
      totalGuias: document.getElementById('totalGuias') as HTMLElement,
      valorTotalGeral: document.getElementById('valorTotalGeral') as HTMLElement,
      valorTotalArquivo: document.getElementById('valorTotalArquivo') as HTMLElement,
      nomeArquivo: document.getElementById('nomeArquivo') as HTMLElement,
      versaoBadge: document.getElementById('versaoBadge') as HTMLElement,
      guiasTable: document.getElementById('guiasTable') as HTMLElement,
      pagination: document.getElementById('pagination') as HTMLElement,
      tabsContainer: document.getElementById('tabsContainer') as HTMLElement,
      fileTabs: document.getElementById('fileTabs') as HTMLElement,
      modalGuia: bs.Modal.getOrCreateInstance(document.getElementById('modalGuia')),
      modalErro: bs.Modal.getOrCreateInstance(document.getElementById('modalErro')),
      modalImportacao: bs.Modal.getOrCreateInstance(document.getElementById('modalImportacao')),
      versaoArquivo: document.getElementById('versaoArquivo') as HTMLElement,
      versaoSelecionadaEl: document.getElementById('versaoSelecionada') as HTMLElement,
      importacaoContent: document.getElementById('importacaoContent') as HTMLElement,
      clearBtn: document.getElementById('clearBtn') as HTMLButtonElement,
      dropZone: document.getElementById('dropZone') as HTMLElement,
      searchInput: document.getElementById('searchInput') as HTMLInputElement,
      emptyState: document.getElementById('emptyState') as HTMLElement,
      loadingOverlay: document.getElementById('loadingOverlay') as HTMLElement,
      loadingText: document.getElementById('loadingText') as HTMLElement,
      loadingProgress: document.getElementById('loadingProgress') as HTMLElement,
      loadingDetail: document.getElementById('loadingDetail') as HTMLElement,
      toastNotification: bs.Toast.getOrCreateInstance(document.getElementById('toastNotification')),
      toastBody: document.getElementById('toastBody') as HTMLElement,
      itensPorPagina: document.getElementById('itensPorPagina') as HTMLSelectElement,
      totalProcedimentos: document.getElementById('totalProcedimentos') as HTMLElement,
      totalQtdExecutada: document.getElementById('totalQtdExecutada') as HTMLElement,
      totalGeralSection: document.getElementById('totalGeralSection') as HTMLElement,
      totalGeralArquivos: document.getElementById('totalGeralArquivos') as HTMLElement,
      totalGuiasGeral: document.getElementById('totalGuiasGeral') as HTMLElement,
      totalProcedimentosGeral: document.getElementById('totalProcedimentosGeral') as HTMLElement,
      totalQtdExecutadaGeral: document.getElementById('totalQtdExecutadaGeral') as HTMLElement,
      colArquivo: document.getElementById('colArquivo') as HTMLElement,
    };

    this.setupEventListeners();
  }

  // ---------------------------------------------------------------------------
  // Event listeners
  // ---------------------------------------------------------------------------

  private setupEventListeners(): void {
    this.elements.fileInput.addEventListener('change', () => this.onFilesSelected());

    this.elements.importarBtn.addEventListener('click', () => this.importarXml());
    this.elements.clearBtn.addEventListener('click', () => this.limparDados());

    // Drag and drop
    const dz = this.elements.dropZone;
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
        this.elements.fileInput.files = dt.files;
        this.onFilesSelected();
      }
    });

    // Busca com debounce
    let searchTimeout: ReturnType<typeof setTimeout>;
    this.elements.searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchTerm = this.elements.searchInput.value.trim().toLowerCase();
        this.currentPage = 1;
        this.renderTable();
        this.renderPagination();
      }, 250);
    });

    // Itens por página
    this.elements.itensPorPagina.addEventListener('change', () => {
      this.itemsPerPage = parseInt(this.elements.itensPorPagina.value, 10);
      this.currentPage = 1;
      this.renderTable();
      this.renderPagination();
    });
  }

  private onFilesSelected(): void {
    const files = this.elements.fileInput.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      this.elements.fileName.textContent = `Arquivo selecionado: ${files[0].name}`;
    } else {
      this.elements.fileName.textContent = `${files.length} arquivos selecionados`;
    }
  }

  // ---------------------------------------------------------------------------
  // Loading overlay
  // ---------------------------------------------------------------------------

  private showLoading(text: string): void {
    this.elements.loadingText.textContent = text;
    this.elements.loadingProgress.style.width = '0%';
    this.elements.loadingDetail.textContent = '';
    this.elements.loadingOverlay.classList.remove('d-none');
  }

  private updateLoading(percent: number, detail: string): void {
    this.elements.loadingProgress.style.width = `${percent}%`;
    this.elements.loadingDetail.textContent = detail;
  }

  private hideLoading(): void {
    this.elements.loadingOverlay.classList.add('d-none');
  }

  // ---------------------------------------------------------------------------
  // Toast
  // ---------------------------------------------------------------------------

  private showToast(message: string, type: 'success' | 'danger' | 'warning' | 'info'): void {
    const toastEl = document.getElementById('toastNotification') as HTMLElement;
    toastEl.className = `toast align-items-center border-0 text-bg-${type}`;
    this.elements.toastBody.textContent = message;
    this.elements.toastNotification.show();
  }

  // ---------------------------------------------------------------------------
  // Leitura e processamento de arquivos
  // ---------------------------------------------------------------------------

  /**
   * Lê um arquivo como ArrayBuffer e decodifica com o encoding correto.
   * Detecta o encoding automaticamente a partir do prólogo XML.
   */
  private lerArquivo(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const buffer = reader.result as ArrayBuffer;
        const encoding = detectarEncoding(buffer);
        const decoder = new TextDecoder(encoding);
        resolve(decoder.decode(buffer));
      };
      reader.onerror = () => reject(new Error(`Falha ao ler arquivo: ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Processa um único arquivo XML. Detecta a versão TISS individualmente,
   * permitindo importação de lotes com versões diferentes.
   */
  private async processarArquivo(file: File): Promise<{
    guias: Guia[];
    totalGeral: number;
    versao: string;
  }> {
    const texto = await this.lerArquivo(file);

    const versao = detectarVersao(texto);
    if (!versao) {
      throw new Error('Versão TISS não encontrada no arquivo');
    }

    if (!isVersaoSuportada(versao)) {
      throw new Error(
        `Versão "${versao}" não suportada. ` +
        `Suportadas: ${Object.keys(TISS_VERSOES).join(', ')}`,
      );
    }

    const config = TISS_VERSOES[versao];
    const parser = new XmlParser(config);
    const resultado = parser.parse(texto);

    log.debug(`Parse concluído: ${resultado.guias.length} guias, versão ${versao}`);

    return { guias: resultado.guias, totalGeral: resultado.totalGeral, versao };
  }

  // ---------------------------------------------------------------------------
  // Fluxo de importação
  // ---------------------------------------------------------------------------

  private async importarXml(): Promise<void> {
    const files = this.elements.fileInput.files;
    if (!files || files.length === 0) {
      this.showToast('Selecione ao menos um arquivo XML.', 'warning');
      return;
    }

    const validFiles = Array.from(files).filter(f =>
      f.name.toLowerCase().endsWith('.xml'),
    );
    if (validFiles.length === 0) {
      this.showToast('Nenhum arquivo XML encontrado na seleção.', 'warning');
      return;
    }

    log.info(`Importando ${validFiles.length} arquivo(s)`);
    this.showLoading('Importando arquivos...');

    this.lotes = [];
    this.arquivoAtual = 0;
    this.currentPage = 1;
    this.searchTerm = '';
    this.itemsPerPage = 20;
    this.elements.searchInput.value = '';
    this.elements.itensPorPagina.value = '20';

    const sucesso: { nome: string; guias: number; total: number; versao: string }[] = [];
    const erros: { nome: string; motivo: string }[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const percent = Math.round(((i + 1) / validFiles.length) * 100);
      this.updateLoading(percent, `${i + 1} de ${validFiles.length}: ${file.name}`);

      try {
        const resultado = await this.processarArquivo(file);

        if (resultado.guias.length === 0) {
          erros.push({ nome: file.name, motivo: 'Nenhuma guia SP/SADT encontrada' });
          continue;
        }

        this.lotes.push({
          nomeArquivo: file.name,
          versao: resultado.versao,
          guias: resultado.guias,
          totalArquivo: resultado.totalGeral,
        });

        sucesso.push({
          nome: file.name,
          guias: resultado.guias.length,
          total: resultado.totalGeral,
          versao: resultado.versao,
        });

        log.info(`${file.name}: ${resultado.guias.length} guias, R$ ${resultado.totalGeral}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Erro desconhecido';
        log.error(`Erro: ${file.name}`, { erro: msg });
        erros.push({ nome: file.name, motivo: msg });
      }
    }

    this.hideLoading();

    log.info('Importação concluída', {
      sucesso: sucesso.length,
      erros: erros.length,
      totalGeral: this.lotes.reduce((s, l) => s + l.totalArquivo, 0),
    });

    if (this.lotes.length === 0) {
      this.mostrarErro(erros);
      return;
    }

    // Exibir botão limpar
    this.elements.clearBtn.classList.remove('d-none');

    // Ocultar área de upload, mostrar resultados
    this.elements.uploadSection.classList.add('d-none');
    this.mostrarModalImportacao(sucesso, erros);
    this.renderResults();

    const totalGuias = this.lotes.reduce((s, l) => s + l.guias.length, 0);
    this.showToast(
      `${sucesso.length} arquivo(s) importado(s) — ${totalGuias} guias`,
      erros.length > 0 ? 'warning' : 'success',
    );
  }

  // ---------------------------------------------------------------------------
  // Exibição de erros
  // ---------------------------------------------------------------------------

  private mostrarErro(erros: { nome: string; motivo: string }[]): void {
    this.elements.versaoArquivo.textContent = erros.length > 0
      ? erros.map(e => `${e.nome}: ${e.motivo}`).join('; ')
      : 'Nenhum arquivo válido';
    this.elements.versaoSelecionadaEl.textContent =
      `Suportadas: ${Object.keys(TISS_VERSOES).join(', ')}`;
    this.elements.modalErro.show();
  }

  // ---------------------------------------------------------------------------
  // Modal de resultado da importação
  // ---------------------------------------------------------------------------

  private mostrarModalImportacao(
    sucesso: { nome: string; guias: number; total: number; versao: string }[],
    erros: { nome: string; motivo: string }[],
  ): void {
    const totalGeral = this.lotes.reduce((sum, l) => sum + l.totalArquivo, 0);
    const totalGuias = this.lotes.reduce((sum, l) => sum + l.guias.length, 0);

    let html = '';

    if (sucesso.length > 0) {
      const rows = sucesso.map(s => `
        <tr>
          <td style="word-break:break-word" title="${escapeHtml(s.nome)}">${escapeHtml(s.nome)}</td>
          <td><span class="badge bg-primary bg-opacity-10 text-primary version-badge">${escapeHtml(s.versao)}</span></td>
          <td class="text-center">${s.guias}</td>
          <td class="text-end">R$ ${this.formatCurrency(s.total)}</td>
        </tr>
      `).join('');

      html += `
        <div class="d-flex align-items-center gap-3 mb-3 p-3 rounded-3" style="background: #d1e7dd;">
          <div>
            <i class="bi bi-check-circle-fill text-success" style="font-size:1.75rem"></i>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold text-success-emphasis">${sucesso.length} arquivo(s) importado(s)</div>
            <div class="text-success-emphasis small">${totalGuias} guias &middot; R$ ${this.formatCurrency(totalGeral)}</div>
          </div>
        </div>
        <div class="table-responsive rounded-2 border" style="max-height: 220px;">
          <table class="table table-sm align-middle mb-0">
            <thead class="sticky-top" style="background:#f8f9fa;">
              <tr>
                <th style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600">Arquivo</th>
                <th style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600">Vers&atilde;o</th>
                <th class="text-center" style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600">Guias</th>
                <th class="text-end" style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600">Valor</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    if (erros.length > 0) {
      const items = erros.map(e =>
        `<li class="mb-1"><strong>${escapeHtml(e.nome)}</strong>: ${escapeHtml(e.motivo)}</li>`,
      ).join('');

      html += `
        <div class="alert alert-danger mt-3 mb-0">
          <div class="fw-bold mb-2"><i class="bi bi-exclamation-triangle me-1"></i>${erros.length} arquivo(s) com erro</div>
          <ul class="mb-0 ps-3 small">${items}</ul>
        </div>
      `;
    }

    this.elements.importacaoContent.innerHTML = html;
    this.elements.modalImportacao.show();
  }

  // ---------------------------------------------------------------------------
  // Limpar dados
  // ---------------------------------------------------------------------------

  private limparDados(): void {
    this.lotes = [];
    this.arquivoAtual = 0;
    this.currentPage = 1;
    this.searchTerm = '';
    this.itemsPerPage = 20;
    this.elements.fileInput.value = '';
    this.elements.fileName.textContent = '';
    this.elements.searchInput.value = '';
    this.elements.itensPorPagina.value = '20';
    this.elements.results.classList.add('d-none');
    this.elements.uploadSection.classList.remove('d-none');
    this.elements.clearBtn.classList.add('d-none');
    this.showToast('Dados limpos com sucesso.', 'info');
  }

  // ---------------------------------------------------------------------------
  // Renderização
  // ---------------------------------------------------------------------------

  private renderResults(): void {
    this.renderTabs();
    this.renderSummary();
    this.renderTable();
    this.renderPagination();
    this.elements.results.classList.remove('d-none');
  }

  /**
   * Renderiza as abas de arquivo. Cada aba mostra "Arq. N" com tooltip
   * contendo nome do arquivo, versão e valor total.
   */
  private renderTabs(): void {
    const container = this.elements.tabsContainer;
    const ul = this.elements.fileTabs;
    ul.innerHTML = '';

    if (this.lotes.length <= 1) {
      container.classList.add('d-none');
      return;
    }

    container.classList.remove('d-none');

    this.lotes.forEach((lote, index) => {
      const li = document.createElement('li');
      li.className = 'nav-item';

      const a = document.createElement('a');
      a.className = `nav-link${index === this.arquivoAtual ? ' active' : ''}`;
      a.href = '#';

      a.title = `${lote.nomeArquivo} (${lote.versao}) — R$ ${this.formatCurrency(lote.totalArquivo)}`;

      // Ícone + nome do arquivo
      const icon = document.createElement('i');
      icon.className = 'bi bi-file-earmark me-1';
      a.appendChild(icon);
      a.appendChild(document.createTextNode(`Arq. ${index + 1}`));

      a.addEventListener('click', (e) => {
        e.preventDefault();
        this.selecionarArquivo(index);
      });

      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  private selecionarArquivo(index: number): void {
    this.arquivoAtual = index;
    this.currentPage = 1;
    this.renderResults();
  }

  /** Retorna as guias do arquivo atual, filtradas pelo termo de busca */
  private get filteredGuias(): Guia[] {
    const guias = this.lotes[this.arquivoAtual]?.guias ?? [];
    if (!this.searchTerm) return guias.slice();

    const term = this.searchTerm;
    return guias.filter(g =>
      g.guiaPrincipal.toLowerCase().includes(term) ||
      g.numeroGuiaPrestador.toLowerCase().includes(term) ||
      g.dadosBeneficiario.numeroCarteira.toLowerCase().includes(term) ||
      g.profissionalSolicitante.nomeProfissional.toLowerCase().includes(term) ||
      g.nomeContratadoSolicitante.toLowerCase().includes(term) ||
      g.senha.toLowerCase().includes(term) ||
      g.CNES.toLowerCase().includes(term) ||
      g.procedimentos.some(p =>
        p.codigoProcedimento.toLowerCase().includes(term) ||
        p.descricaoProcedimento.toLowerCase().includes(term),
      ),
    );
  }

  private get totalGeral(): number {
    return this.lotes.reduce((sum, lote) => sum + lote.totalArquivo, 0);
  }

  private renderSummary(): void {
    const loteAtual = this.lotes[this.arquivoAtual];
    const totalArquivo = loteAtual?.totalArquivo ?? 0;
    const nomeArquivo = loteAtual?.nomeArquivo ?? '';
    const versaoAtual = loteAtual?.versao ?? '';

    // Grupo: Arquivo atual
    const nomeSemExt = nomeArquivo.replace(/\.(xml|XML)$/, '');
    this.elements.nomeArquivo.textContent = nomeSemExt;
    this.elements.nomeArquivo.title = nomeArquivo;
    this.elements.versaoBadge.textContent = `TISS ${versaoAtual}`;
    this.elements.valorTotalArquivo.textContent = `R$ ${this.formatCurrency(totalArquivo)}`;

    const guias = loteAtual?.guias ?? [];
    const totalProcs = guias.reduce((sum, g) => sum + g.procedimentos.length, 0);
    const totalQtdExec = guias.reduce((sum, g) =>
      sum + g.procedimentos.reduce((s, p) => s + (parseInt(p.quantidadeExecutada) || 0), 0), 0,
    );

    this.elements.totalGuias.textContent = String(guias.length);
    this.elements.totalProcedimentos.textContent = String(totalProcs);
    this.elements.totalQtdExecutada.textContent = String(totalQtdExec);

    // Grupo: Total Geral (só aparece com múltiplos arquivos)
    if (this.lotes.length > 1) {
      this.elements.colArquivo.className = 'col-md-6';
      this.elements.totalGeralSection.classList.remove('d-none');
      this.elements.totalGeralArquivos.textContent = `${this.lotes.length} arquivos importados`;
      this.elements.valorTotalGeral.textContent = `R$ ${this.formatCurrency(this.totalGeral)}`;

      const allGuias = this.lotes.flatMap(l => l.guias);
      const geralProcs = allGuias.reduce((sum, g) => sum + g.procedimentos.length, 0);
      const geralQtdExec = allGuias.reduce((sum, g) =>
        sum + g.procedimentos.reduce((s, p) => s + (parseInt(p.quantidadeExecutada) || 0), 0), 0,
      );

      this.elements.totalGuiasGeral.textContent = String(allGuias.length);
      this.elements.totalProcedimentosGeral.textContent = String(geralProcs);
      this.elements.totalQtdExecutadaGeral.textContent = String(geralQtdExec);
    } else {
      this.elements.colArquivo.className = 'col-12';
      this.elements.totalGeralSection.classList.add('d-none');
    }
  }

  /**
   * Renderiza a tabela de guias usando DOM API (createElement/textContent)
   * ao invés de innerHTML para prevenir XSS com dados do XML.
   */
  private renderTable(): void {
    const tbody = this.elements.guiasTable;
    tbody.innerHTML = '';

    const guias = this.filteredGuias;

    // Estado vazio
    if (guias.length === 0) {
      this.elements.emptyState.classList.remove('d-none');
      return;
    }
    this.elements.emptyState.classList.add('d-none');

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const guiasPage = guias.slice(start, end);

    const loteGuias = this.lotes[this.arquivoAtual]?.guias ?? [];

    guiasPage.forEach((guia) => {
      const originalIndex = loteGuias.indexOf(guia);
      const tr = document.createElement('tr');

      const cells: [string, string][] = [
        [guia.guiaPrincipal, ''],
        [guia.numeroGuiaPrestador, ''],
        [guia.dadosBeneficiario.numeroCarteira, ''],
        [this.formatDate(guia.dataAutorizacao) || '-', ''],
        [this.formatCurrency(parseFloat(guia.valores.valorTotalGeral) || 0), 'text-end'],
      ];

      for (const [text, cls] of cells) {
        const td = document.createElement('td');
        td.textContent = text;
        if (cls) td.className = cls;
        tr.appendChild(td);
      }

      // Botão de ação
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'text-center';
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-outline-primary rounded-pill';
      btn.title = 'Ver detalhes';
      const icon = document.createElement('i');
      icon.className = 'bi bi-eye';
      btn.appendChild(icon);
      btn.addEventListener('click', () => this.openModal(originalIndex, this.arquivoAtual));
      tdAcoes.appendChild(btn);
      tr.appendChild(tdAcoes);

      tbody.appendChild(tr);
    });
  }

  /**
   * Renderiza a paginação usando DOM API para prevenir XSS.
   */
  private renderPagination(): void {
    const guias = this.filteredGuias;
    const totalPages = Math.ceil(guias.length / this.itemsPerPage);
    const pagination = this.elements.pagination;
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    const createPageItem = (
      page: number,
      text: string,
      isActive: boolean,
      isDisabled: boolean,
    ): HTMLLIElement => {
      const li = document.createElement('li');
      li.className = `page-item${isActive ? ' active' : ''}${isDisabled ? ' disabled' : ''}`;
      const a = document.createElement('a');
      a.className = 'page-link';
      a.href = '#';
      a.textContent = text;
      if (!isDisabled) {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          this.changePage(page);
        });
      }
      li.appendChild(a);
      return li;
    };

    // Anterior
    pagination.appendChild(
      createPageItem(this.currentPage - 1, '\u2039', false, this.currentPage === 1),
    );

    // Números de página com elipse
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) {
      pagination.appendChild(createPageItem(1, '1', false, false));
      if (startPage > 2) {
        const dots = document.createElement('li');
        dots.className = 'page-item disabled';
        dots.innerHTML = '<span class="page-link">&hellip;</span>';
        pagination.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pagination.appendChild(
        createPageItem(i, String(i), i === this.currentPage, false),
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('li');
        dots.className = 'page-item disabled';
        dots.innerHTML = '<span class="page-link">&hellip;</span>';
        pagination.appendChild(dots);
      }
      pagination.appendChild(createPageItem(totalPages, String(totalPages), false, false));
    }

    // Próxima
    pagination.appendChild(
      createPageItem(this.currentPage + 1, '\u203A', false, this.currentPage === totalPages),
    );
  }

  private changePage(page: number): void {
    this.currentPage = page;
    this.renderTable();
    this.renderPagination();
  }

  // ---------------------------------------------------------------------------
  // Modal de detalhes da guia
  // ---------------------------------------------------------------------------

  private openModal(index: number, arquivoIndex: number): void {
    const lote = this.lotes[arquivoIndex];
    if (!lote) return;

    const guia = lote.guias[index];
    if (!guia) return;

    const modalBody = document.getElementById('modalBody') as HTMLElement;
    const proceduresHtml = this.generateProceduresTable(guia);

    // Todos os dados externos são escapados com escapeHtml()
    modalBody.innerHTML = `
      <div class="d-flex flex-wrap align-items-center gap-2 mb-4 pb-3" style="border-bottom: 1px solid #e9ecef;">
        <span class="badge bg-primary bg-opacity-10 text-primary version-badge">${escapeHtml(lote.versao)}</span>
        <span class="badge bg-light text-dark border version-badge" title="${escapeHtml(lote.nomeArquivo)}">
          <i class="bi bi-file-earmark me-1"></i>${escapeHtml(lote.nomeArquivo)}
        </span>
        <span class="badge bg-light text-dark border version-badge">
          Guia ${index + 1} de ${lote.guias.length}
        </span>

      </div>

      <div class="detail-section">
        <h6><i class="bi bi-hash me-1"></i>Transação</h6>
        <div class="row">
          ${this.field('Sequencial', guia.sequencialTransacao)}
          ${this.field('Data Registro', this.formatDate(guia.dataRegistroTransacao))}
          ${this.field('Hora Registro', guia.horaRegistroTransacao)}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-card-heading me-1"></i>Cabeçalho</h6>
        <div class="row">
          ${this.field('Registro ANS', guia.registroANS)}
          ${this.field('Guia Principal', guia.guiaPrincipal)}
          ${this.field('Nº Guia Prestador', guia.numeroGuiaPrestador)}
          ${this.field('Nº Guia Operadora', guia.numeroGuiaOperadora)}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-person-badge me-1"></i>Beneficiário</h6>
        <div class="row">
          ${this.field('Nº Carteira', guia.dadosBeneficiario.numeroCarteira)}
          ${this.field('Atendimento RN', guia.dadosBeneficiario.atendimentoRN)}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-key me-1"></i>Autorização</h6>
        <div class="row">
          ${this.field('Data Autorização', this.formatDate(guia.dataAutorizacao))}
          ${this.field('Senha', guia.senha)}
          ${this.field('Validade da Senha', this.formatDate(guia.dataValidadeSenha))}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-person me-1"></i>Solicitante</h6>
        <div class="row">
          ${this.field('Contratado', guia.nomeContratadoSolicitante, 'col-md-6')}
          ${this.field('Código Contratado', guia.codigoContratadoSolicitante, 'col-md-6')}
          ${this.field('Profissional', guia.profissionalSolicitante.nomeProfissional, 'col-md-6')}
          ${this.field('Conselho', guia.profissionalSolicitante.codigoConselhoProfissional && guia.profissionalSolicitante.numeroConselhoProfissional ? `${guia.profissionalSolicitante.codigoConselhoProfissional} - ${guia.profissionalSolicitante.numeroConselhoProfissional}/${guia.profissionalSolicitante.UFConselho}` : '', 'col-md-6')}
          ${this.field('CBO', guia.profissionalSolicitante.CBO)}
          ${this.field('Data Solicitação', this.formatDate(guia.dataSolicitacao))}
          ${this.field('Caráter Atendimento', guia.caraterAtendimento)}
          ${this.field('Indicação Clínica', guia.indicacaoClinica, 'col-md-6')}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-hospital me-1"></i>Executante</h6>
        <div class="row">
          ${this.field('Código na Operadora', guia.codigoContratadoExecutante, 'col-md-6')}
          ${this.field('CNES', guia.CNES, 'col-md-6')}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-clipboard2-pulse me-1"></i>Atendimento</h6>
        <div class="row">
          ${this.field('Tipo Atendimento', guia.tipoAtendimento)}
          ${this.field('Indicação Acidente', guia.indicacaoAcidente)}
          ${this.field('Regime Atendimento', guia.regimeAtendimento)}
          ${this.field('Tipo Consulta', guia.tipoConsulta)}
          ${this.field('Observação', guia.observacao, 'col-12')}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-currency-dollar me-1"></i>Valores</h6>
        <div class="row">
          ${this.fieldCurrency('Procedimentos', guia.valores.valorProcedimentos)}
          ${this.fieldCurrency('Diárias', guia.valores.valorDiarias)}
          ${this.fieldCurrency('Taxas/Aluguéis', guia.valores.valorTaxasAlugueis)}
          ${this.fieldCurrency('Materiais', guia.valores.valorMateriais)}
          ${this.fieldCurrency('Medicamentos', guia.valores.valorMedicamentos)}
          ${this.fieldCurrency('Total Geral', guia.valores.valorTotalGeral, 'col-md-4', '', true)}
        </div>
      </div>

      <div class="detail-section mb-0">
        <h6><i class="bi bi-list-check me-1"></i>Procedimentos Executados (${guia.procedimentos.length})</h6>
        ${proceduresHtml}
      </div>
    `;

    this.elements.modalGuia.show();
  }

  private generateProceduresTable(guia: Guia): string {
    if (guia.procedimentos.length === 0) {
      return '<p class="text-muted small">Nenhum procedimento encontrado.</p>';
    }

    const rows = guia.procedimentos.map(proc => `
      <tr>
        <td class="text-center text-muted">${escapeHtml(proc.sequencialItem)}</td>
        <td>${escapeHtml(proc.codigoTabela)}-${escapeHtml(proc.codigoProcedimento)}</td>
        <td>${escapeHtml(proc.descricaoProcedimento)}</td>
        <td class="text-center">${parseInt(proc.quantidadeExecutada) || 0}</td>
        <td class="text-center">${escapeHtml(this.formatNumber(proc.reducaoAcrescimo))}</td>
        <td class="text-end">${this.formatCurrency(parseFloat(proc.valorUnitario) || 0)}</td>
        <td class="text-end">${this.formatCurrency(parseFloat(proc.valorTotal) || 0)}</td>
      </tr>
    `).join('');

    const thStyle = 'font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600;padding:0.5rem 0.4rem';

    return `
      <div class="table-responsive rounded-2 border">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead style="background:#f8f9fa;">
            <tr>
              <th class="text-center" style="${thStyle};width:40px">#</th>
              <th style="${thStyle};min-width:120px">Código</th>
              <th style="${thStyle};min-width:200px">Descrição</th>
              <th class="text-center" style="${thStyle};width:45px">Qtd</th>
              <th class="text-center" style="${thStyle};width:70px">Red./Acr.</th>
              <th class="text-end" style="${thStyle};width:90px">Valor Unit.</th>
              <th class="text-end" style="${thStyle};width:90px">Valor Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr style="background: var(--tiss-primary-soft);">
              <td colspan="6" class="text-end fw-semibold" style="font-size:0.85rem;color:#374151">Total da Guia</td>
              <td class="text-end" style="font-size:0.85rem;color:var(--tiss-primary)">R$ ${this.formatCurrency(parseFloat(guia.valores.valorTotalGeral) || 0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Helpers de formatação
  // ---------------------------------------------------------------------------

  private formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private formatDate(dateStr: string): string {
    if (!dateStr || dateStr.length !== 10) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  /**
   * Formata string numérica TISS removendo zeros à esquerda
   * e decimais desnecessários (ex: "00000001.00" -> "1").
   */
  private formatNumber(value: string): string {
    if (!value) return '';
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return value;
    return Number.isInteger(num) ? String(num) : num.toString();
  }

  /**
   * Gera um campo de detalhe somente se o valor for preenchido.
   * Retorna string vazia caso contrário, evitando campos em branco no modal.
   */
  private field(label: string, value: string, colClass = 'col-md-4'): string {
    if (!value) return '';
    return `
      <div class="${colClass} detail-field">
        <strong>${label}</strong>
        <span>${escapeHtml(value)}</span>
      </div>`;
  }

  /**
   * Gera um campo de detalhe com valor monetário formatado.
   * Converte strings TISS como "00000115.72" para "R$ 115,72".
   * Oculta o campo se o valor for vazio ou zero.
   */
  private fieldCurrency(label: string, value: string, colClass = 'col-md-4', spanClass = '', showZero = false): string {
    if (!value) return '';
    const num = parseFloat(value);
    if (!Number.isFinite(num)) return '';
    if (num === 0 && !showZero) return '';
    const formatted = `R$ ${this.formatCurrency(num)}`;
    return `
      <div class="${colClass} detail-field">
        <strong>${label}</strong>
        <span${spanClass ? ` class="${spanClass}"` : ''}>${escapeHtml(formatted)}</span>
      </div>`;
  }
}
