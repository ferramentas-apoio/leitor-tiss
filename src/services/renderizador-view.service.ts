/**
 * Serviço de Renderização de Views
 * 
 * Responsável por renderizar componentes visuais da aplicação:
 * tabelas, paginação, modais e elementos de UI.
 * Todas as renderizações usam DOM API para prevenir XSS.
 */

import { Guia } from '../types/guia.types';
import { ResultadoArquivoImportado, ErroImportacao } from './importador-arquivos.service';
import { formatarMoeda, formatarData, formatarNumero, parseValorMonetario } from '../utils/formatadores';
import { escaparHtml, criarElemento, limparElemento } from '../utils/dom';

/** Callback para abrir modal de guia */
type CallbackAbrirModalGuia = (indiceGuia: number, indiceArquivo: number) => void;

/** Callback para seleção de arquivo */
type CallbackSelecionarArquivo = (indice: number) => void;

/** Callback para mudança de página */
type CallbackMudarPagina = (pagina: number) => void;

/**
 * Serviço responsável pela renderização de componentes visuais.
 */
export class ServicoRenderizacao {
  private callbackAbrirModalGuia?: CallbackAbrirModalGuia;
  private callbackSelecionarArquivo?: CallbackSelecionarArquivo;
  private callbackMudarPagina?: CallbackMudarPagina;

  onAbrirModalGuia(callback: CallbackAbrirModalGuia): void {
    this.callbackAbrirModalGuia = callback;
  }

  onSelecionarArquivo(callback: CallbackSelecionarArquivo): void {
    this.callbackSelecionarArquivo = callback;
  }

  onMudarPagina(callback: CallbackMudarPagina): void {
    this.callbackMudarPagina = callback;
  }

  /**
   * Renderiza as abas de seleção de arquivos.
   * 
   * @param container - Elemento container das abas
   * @param lista - Elemento UL das abas
   * @param lotes - Lista de lotes importados
   * @param arquivoAtual - Índice do arquivo atualmente selecionado
   */
  renderizarAbas(
    container: HTMLElement,
    lista: HTMLElement,
    lotes: ResultadoArquivoImportado[],
    arquivoAtual: number
  ): void {
    limparElemento(lista);
    
    if (lotes.length <= 1) {
      container.classList.add('d-none');
      return;
    }
    
    container.classList.remove('d-none');
    
    lotes.forEach((lote, indice) => {
      const li = document.createElement('li');
      li.className = 'nav-item';
      
      const link = criarElemento('a', {
        classes: ['nav-link', indice === arquivoAtual ? 'active' : ''].filter(Boolean),
        atributos: { href: '#' },
      });
      
      link.title = `${lote.nomeArquivo} (${lote.versao}) — R$ ${formatarMoeda(lote.totalArquivo)}`;
      
      // Ícone
      const icone = criarElemento('i', { classes: ['bi', 'bi-file-earmark', 'me-1'] });
      link.appendChild(icone);
      link.appendChild(document.createTextNode(`Arq. ${indice + 1}`));
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.callbackSelecionarArquivo?.(indice);
      });
      
      li.appendChild(link);
      lista.appendChild(li);
    });
  }

  /**
   * Renderiza o resumo estatístico.
   * 
   * @param elementos - Mapa de elementos DOM
   * @param loteAtual - Lote atual sendo exibido
   * @param lotes - Todos os lotes importados
   */
  renderizarResumo(
    elementos: Record<string, HTMLElement>,
    loteAtual: ResultadoArquivoImportado | undefined,
    lotes: ResultadoArquivoImportado[]
  ): void {
    const totalArquivo = loteAtual?.totalArquivo ?? 0;
    const nomeArquivo = loteAtual?.nomeArquivo ?? '';
    const versaoAtual = loteAtual?.versao ?? '';
    const guias = loteAtual?.guias ?? [];
    
    // Grupo: Arquivo atual
    const nomeSemExt = nomeArquivo.replace(/\.(xml|XML)$/, '');
    elementos.nomeArquivo.textContent = nomeSemExt;
    (elementos.nomeArquivo as HTMLElement).title = nomeArquivo;
    elementos.versaoBadge.textContent = `TISS ${versaoAtual}`;
    elementos.valorTotalArquivo.textContent = `R$ ${formatarMoeda(totalArquivo)}`;
    
    // Contadores do arquivo atual
    const totalProcs = guias.reduce((sum, g) => sum + g.procedimentos.length, 0);
    const totalQtdExec = guias.reduce((sum, g) =>
      sum + g.procedimentos.reduce((s, p) => s + (parseInt(p.quantidadeExecutada) || 0), 0), 0
    );
    
    elementos.totalGuias.textContent = String(guias.length);
    elementos.totalProcedimentos.textContent = String(totalProcs);
    elementos.totalQtdExecutada.textContent = String(totalQtdExec);
    
    // Grupo: Total Geral (só aparece com múltiplos arquivos)
    if (lotes.length > 1) {
      elementos.colArquivo.className = 'col-md-6';
      elementos.totalGeralSection.classList.remove('d-none');
      elementos.totalGeralArquivos.textContent = `${lotes.length} arquivos importados`;
      
      const totalGeral = lotes.reduce((sum, l) => sum + l.totalArquivo, 0);
      elementos.valorTotalGeral.textContent = `R$ ${formatarMoeda(totalGeral)}`;
      
      const allGuias = lotes.flatMap(l => l.guias);
      const geralProcs = allGuias.reduce((sum, g) => sum + g.procedimentos.length, 0);
      const geralQtdExec = allGuias.reduce((sum, g) =>
        sum + g.procedimentos.reduce((s, p) => s + (parseInt(p.quantidadeExecutada) || 0), 0), 0
      );
      
      elementos.totalGuiasGeral.textContent = String(allGuias.length);
      elementos.totalProcedimentosGeral.textContent = String(geralProcs);
      elementos.totalQtdExecutadaGeral.textContent = String(geralQtdExec);
    } else {
      elementos.colArquivo.className = 'col-12';
      elementos.totalGeralSection.classList.add('d-none');
    }
  }

  /**
   * Renderiza a tabela de guias.
   * 
   * @param tbody - Elemento tbody da tabela
   * @param estadoVazio - Elemento de estado vazio
   * @param guias - Guias a serem exibidas
   * @param guiasLoteCompleto - Todas as guias do lote (para índice original)
   * @param indiceArquivo - Índice do arquivo atual
   */
  renderizarTabelaGuias(
    tbody: HTMLElement,
    estadoVazio: HTMLElement,
    guias: Guia[],
    guiasLoteCompleto: Guia[],
    indiceArquivo: number
  ): void {
    limparElemento(tbody);
    
    if (guias.length === 0) {
      estadoVazio.classList.remove('d-none');
      return;
    }
    
    estadoVazio.classList.add('d-none');
    
    guias.forEach((guia) => {
      const indiceOriginal = guiasLoteCompleto.indexOf(guia);
      const tr = document.createElement('tr');
      
      // Células
      const celulas = [
        { texto: guia.guiaPrincipal },
        { texto: guia.numeroGuiaPrestador },
        { texto: guia.dadosBeneficiario.numeroCarteira },
        { texto: formatarData(guia.dataAutorizacao) || '-' },
        { texto: formatarMoeda(parseValorMonetario(guia.valores.valorTotalGeral)), classe: 'text-end' },
      ];
      
      celulas.forEach(({ texto, classe }) => {
        const td = criarElemento('td', { texto });
        if (classe) td.className = classe;
        tr.appendChild(td);
      });
      
      // Botão de ação
      const tdAcoes = criarElemento('td', { classes: ['text-center'] });
      const btn = criarElemento('button', {
        classes: ['btn', 'btn-sm', 'btn-outline-primary', 'rounded-pill'],
        atributos: { title: 'Ver detalhes' },
      });
      const icone = criarElemento('i', { classes: ['bi', 'bi-eye'] });
      btn.appendChild(icone);
      btn.addEventListener('click', () => {
        this.callbackAbrirModalGuia?.(indiceOriginal, indiceArquivo);
      });
      tdAcoes.appendChild(btn);
      tr.appendChild(tdAcoes);
      
      tbody.appendChild(tr);
    });
  }

  /**
   * Renderiza a paginação.
   * 
   * @param container - Elemento UL da paginação
   * @param paginaAtual - Página atual
   * @param totalPaginas - Total de páginas
   */
  renderizarPaginacao(
    container: HTMLElement,
    paginaAtual: number,
    totalPaginas: number
  ): void {
    limparElemento(container);
    
    if (totalPaginas <= 1) return;
    
    const criarItemPagina = (
      pagina: number,
      texto: string,
      ativo: boolean,
      desabilitado: boolean
    ): HTMLLIElement => {
      const li = document.createElement('li');
      li.className = `page-item${ativo ? ' active' : ''}${desabilitado ? ' disabled' : ''}`;
      
      const link = criarElemento('a', {
        classes: ['page-link'],
        atributos: { href: '#' },
        texto,
      });
      
      if (!desabilitado) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.callbackMudarPagina?.(pagina);
        });
      }
      
      li.appendChild(link);
      return li;
    };
    
    // Anterior
    container.appendChild(
      criarItemPagina(paginaAtual - 1, '\u2039', false, paginaAtual === 1)
    );
    
    // Números de página com elipse
    const maxVisiveis = 5;
    let paginaInicio = Math.max(1, paginaAtual - Math.floor(maxVisiveis / 2));
    const paginaFim = Math.min(totalPaginas, paginaInicio + maxVisiveis - 1);
    paginaInicio = Math.max(1, paginaFim - maxVisiveis + 1);
    
    if (paginaInicio > 1) {
      container.appendChild(criarItemPagina(1, '1', false, false));
      if (paginaInicio > 2) {
        const dots = criarElemento('li', { classes: ['page-item', 'disabled'] });
        dots.innerHTML = '<span class="page-link">&hellip;</span>';
        container.appendChild(dots);
      }
    }
    
    for (let i = paginaInicio; i <= paginaFim; i++) {
      container.appendChild(criarItemPagina(i, String(i), i === paginaAtual, false));
    }
    
    if (paginaFim < totalPaginas) {
      if (paginaFim < totalPaginas - 1) {
        const dots = document.createElement('li');
        dots.className = 'page-item disabled';
        dots.innerHTML = '<span class="page-link">&hellip;</span>';
        container.appendChild(dots);
      }
      container.appendChild(criarItemPagina(totalPaginas, String(totalPaginas), false, false));
    }
    
    // Próxima
    container.appendChild(
      criarItemPagina(paginaAtual + 1, '\u203A', false, paginaAtual === totalPaginas)
    );
  }

  /**
   * Gera o HTML para o modal de detalhes da guia (com escape de XSS).
   * 
   * @param guia - Guia a ser exibida
   * @param lote - Lote ao qual a guia pertence
   * @param indiceGuia - Índice da guia no lote
   * @returns HTML seguro para inserir no modal
   */
  gerarHtmlModalGuia(guia: Guia, lote: ResultadoArquivoImportado, indiceGuia: number): string {
    const tabelaProcedimentos = this.gerarTabelaProcedimentos(guia);
    
    return `
      <div class="d-flex flex-wrap align-items-center gap-2 mb-4 pb-3" style="border-bottom: 1px solid #e9ecef;">
        <span class="badge bg-primary bg-opacity-10 text-primary version-badge">${escaparHtml(lote.versao)}</span>
        <span class="badge bg-light text-dark border version-badge" title="${escaparHtml(lote.nomeArquivo)}">
          <i class="bi bi-file-earmark me-1"></i>${escaparHtml(lote.nomeArquivo)}
        </span>
        <span class="badge bg-light text-dark border version-badge">
          Guia ${indiceGuia + 1} de ${lote.guias.length}
        </span>
      </div>

      ${this.gerarSecaoDetalhes('Transação', 'bi-hash', [
        { label: 'Sequencial', value: guia.sequencialTransacao },
        { label: 'Data Registro', value: formatarData(guia.dataRegistroTransacao) },
        { label: 'Hora Registro', value: guia.horaRegistroTransacao },
      ])}

      ${this.gerarSecaoDetalhes('Cabeçalho', 'bi-card-heading', [
        { label: 'Registro ANS', value: guia.registroANS },
        { label: 'Guia Principal', value: guia.guiaPrincipal },
        { label: 'Nº Guia Prestador', value: guia.numeroGuiaPrestador },
        { label: 'Nº Guia Operadora', value: guia.numeroGuiaOperadora },
      ])}

      ${this.gerarSecaoDetalhes('Beneficiário', 'bi-person-badge', [
        { label: 'Nº Carteira', value: guia.dadosBeneficiario.numeroCarteira },
        { label: 'Atendimento RN', value: guia.dadosBeneficiario.atendimentoRN },
      ])}

      ${this.gerarSecaoDetalhes('Autorização', 'bi-key', [
        { label: 'Data Autorização', value: formatarData(guia.dataAutorizacao) },
        { label: 'Senha', value: guia.senha },
        { label: 'Validade da Senha', value: formatarData(guia.dataValidadeSenha) },
      ])}

      ${this.gerarSecaoDetalhes('Solicitante', 'bi-person', [
        { label: 'Contratado', value: guia.nomeContratadoSolicitante, classe: 'col-md-6' },
        { label: 'Código Contratado', value: guia.codigoContratadoSolicitante, classe: 'col-md-6' },
        { label: 'Profissional', value: guia.profissionalSolicitante.nomeProfissional, classe: 'col-md-6' },
        { label: 'Conselho', value: this.formatarConselho(guia.profissionalSolicitante), classe: 'col-md-6' },
        { label: 'CBO', value: guia.profissionalSolicitante.CBO },
        { label: 'Data Solicitação', value: formatarData(guia.dataSolicitacao) },
        { label: 'Caráter Atendimento', value: guia.caraterAtendimento },
        { label: 'Indicação Clínica', value: guia.indicacaoClinica, classe: 'col-md-6' },
      ])}

      ${this.gerarSecaoDetalhes('Executante', 'bi-hospital', [
        { label: 'Código na Operadora', value: guia.codigoContratadoExecutante, classe: 'col-md-6' },
        { label: 'CNES', value: guia.CNES, classe: 'col-md-6' },
      ])}

      ${this.gerarSecaoDetalhes('Atendimento', 'bi-clipboard2-pulse', [
        { label: 'Tipo Atendimento', value: guia.tipoAtendimento },
        { label: 'Indicação Acidente', value: guia.indicacaoAcidente },
        { label: 'Regime Atendimento', value: guia.regimeAtendimento },
        { label: 'Tipo Consulta', value: guia.tipoConsulta },
        { label: 'Observação', value: guia.observacao, classe: 'col-12' },
      ])}

      ${this.gerarSecaoValores(guia)}

      <div class="detail-section mb-0">
        <h6><i class="bi bi-list-check me-1"></i>Procedimentos Executados (${guia.procedimentos.length})</h6>
        ${tabelaProcedimentos}
      </div>
    `;
  }

  /**
   * Gera HTML para uma seção de detalhes.
   */
  private gerarSecaoDetalhes(
    titulo: string,
    icone: string,
    campos: { label: string; value: string; classe?: string }[]
  ): string {
    const camposHtml = campos
      .filter(c => c.value)
      .map(c => this.gerarCampo(c.label, c.value, c.classe || 'col-md-4'))
      .join('');
    
    if (!camposHtml) return '';
    
    return `
      <div class="detail-section">
        <h6><i class="bi ${icone} me-1"></i>${titulo}</h6>
        <div class="row">${camposHtml}</div>
      </div>
    `;
  }

  /**
   * Gera HTML para a seção de valores.
   */
  private gerarSecaoValores(guia: Guia): string {
    const campos = [
      { label: 'Procedimentos', valor: guia.valores.valorProcedimentos },
      { label: 'Diárias', valor: guia.valores.valorDiarias },
      { label: 'Taxas/Aluguéis', valor: guia.valores.valorTaxasAlugueis },
      { label: 'Materiais', valor: guia.valores.valorMateriais },
      { label: 'Medicamentos', valor: guia.valores.valorMedicamentos },
      { label: 'Total Geral', valor: guia.valores.valorTotalGeral, destaque: true },
    ];
    
    const camposHtml = campos
      .filter(c => c.valor && parseValorMonetario(c.valor) > 0)
      .map(c => this.gerarCampoMoeda(c.label, c.valor, c.destaque))
      .join('');
    
    if (!camposHtml) return '';
    
    return `
      <div class="detail-section">
        <h6><i class="bi bi-currency-dollar me-1"></i>Valores</h6>
        <div class="row">${camposHtml}</div>
      </div>
    `;
  }

  /**
   * Gera HTML para um campo simples.
   */
  private gerarCampo(label: string, valor: string, classe: string): string {
    return `
      <div class="${classe} detail-field">
        <strong>${label}</strong>
        <span>${escaparHtml(valor)}</span>
      </div>
    `;
  }

  /**
   * Gera HTML para um campo monetário.
   */
  private gerarCampoMoeda(label: string, valor: string, destaque = false): string {
    const num = parseValorMonetario(valor);
    const formatado = `R$ ${formatarMoeda(num)}`;
    const classeSpan = destaque ? 'text-primary fw-semibold' : '';
    
    return `
      <div class="col-md-4 detail-field">
        <strong>${label}</strong>
        <span class="${classeSpan}">${escaparHtml(formatado)}</span>
      </div>
    `;
  }

  /**
   * Formata os dados do conselho profissional.
   */
  private formatarConselho(prof: Guia['profissionalSolicitante']): string {
    if (!prof.codigoConselhoProfissional || !prof.numeroConselhoProfissional) return '';
    return `${prof.codigoConselhoProfissional} - ${prof.numeroConselhoProfissional}/${prof.UFConselho}`;
  }

  /**
   * Gera a tabela de procedimentos.
   */
  private gerarTabelaProcedimentos(guia: Guia): string {
    if (guia.procedimentos.length === 0) {
      return '<p class="text-muted small">Nenhum procedimento encontrado.</p>';
    }
    
    const estiloTh = 'font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600;padding:0.5rem 0.4rem';
    
    const linhas = guia.procedimentos.map(proc => `
      <tr>
        <td class="text-center text-muted">${escaparHtml(proc.sequencialItem)}</td>
        <td>${escaparHtml(proc.codigoTabela)}-${escaparHtml(proc.codigoProcedimento)}</td>
        <td>${escaparHtml(proc.descricaoProcedimento)}</td>
        <td class="text-center">${parseInt(proc.quantidadeExecutada) || 0}</td>
        <td class="text-center">${escaparHtml(formatarNumero(proc.reducaoAcrescimo))}</td>
        <td class="text-end">${formatarMoeda(parseValorMonetario(proc.valorUnitario))}</td>
        <td class="text-end">${formatarMoeda(parseValorMonetario(proc.valorTotal))}</td>
      </tr>
    `).join('');
    
    return `
      <div class="table-responsive rounded-2 border">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead style="background:#f8f9fa;">
            <tr>
              <th class="text-center" style="${estiloTh};width:40px">#</th>
              <th style="${estiloTh};min-width:120px">Código</th>
              <th style="${estiloTh};min-width:200px">Descrição</th>
              <th class="text-center" style="${estiloTh};width:45px">Qtd</th>
              <th class="text-center" style="${estiloTh};width:70px">Red./Acr.</th>
              <th class="text-end" style="${estiloTh};width:90px">Valor Unit.</th>
              <th class="text-end" style="${estiloTh};width:90px">Valor Total</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
          <tfoot>
            <tr style="background: var(--tiss-primary-soft);">
              <td colspan="6" class="text-end fw-semibold" style="font-size:0.85rem;color:#374151">Total da Guia</td>
              <td class="text-end" style="font-size:0.85rem;color:var(--tiss-primary)">R$ ${formatarMoeda(parseValorMonetario(guia.valores.valorTotalGeral))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }

  /**
   * Gera HTML para o modal de importação.
   * 
   * @param lotes - Lotes importados com sucesso
   * @param erros - Erros de importação
   * @returns HTML seguro para o modal
   */
  gerarHtmlModalImportacao(
    lotes: ResultadoArquivoImportado[],
    erros: ErroImportacao[]
  ): string {
    const totalGeral = lotes.reduce((sum, l) => sum + l.totalArquivo, 0);
    const totalGuias = lotes.reduce((sum, l) => sum + l.guias.length, 0);
    
    let html = '';
    
    if (lotes.length > 0) {
      const linhas = lotes.map(lote => `
        <tr>
          <td style="word-break:break-word" title="${escaparHtml(lote.nomeArquivo)}">${escaparHtml(lote.nomeArquivo)}</td>
          <td><span class="badge bg-primary bg-opacity-10 text-primary version-badge">${escaparHtml(lote.versao)}</span></td>
          <td class="text-center">${lote.guias.length}</td>
          <td class="text-end">R$ ${formatarMoeda(lote.totalArquivo)}</td>
        </tr>
      `).join('');
      
      html += `
        <div class="d-flex align-items-center gap-3 mb-3 p-3 rounded-3" style="background: #d1e7dd;">
          <div>
            <i class="bi bi-check-circle-fill text-success" style="font-size:1.75rem"></i>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold text-success-emphasis">${lotes.length} arquivo(s) importado(s)</div>
            <div class="text-success-emphasis small">${totalGuias} guias &middot; R$ ${formatarMoeda(totalGeral)}</div>
          </div>
        </div>
        <div class="table-responsive rounded-2 border" style="max-height: 220px;">
          <table class="table table-sm align-middle mb-0">
            <thead class="sticky-top" style="background:#f8f9fa;">
              <tr>
                <th style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600">Arquivo</th>
                <th style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600">Versão</th>
                <th class="text-center" style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600">Guias</th>
                <th class="text-end" style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600">Valor</th>
              </tr>
            </thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
      `;
    }
    
    if (erros.length > 0) {
      const itens = erros.map(e =>
        `<li class="mb-1"><strong>${escaparHtml(e.nomeArquivo)}</strong>: ${escaparHtml(e.motivo)}</li>`
      ).join('');
      
      html += `
        <div class="alert alert-danger mt-3 mb-0">
          <div class="fw-bold mb-2"><i class="bi bi-exclamation-triangle me-1"></i>${erros.length} arquivo(s) com erro</div>
          <ul class="mb-0 ps-3 small">${itens}</ul>
        </div>
      `;
    }
    
    return html;
  }
}
