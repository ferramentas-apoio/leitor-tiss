var w=Object.defineProperty;var q=(m,e,a)=>e in m?w(m,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):m[e]=a;var v=(m,e,a)=>q(m,typeof e!="symbol"?e+"":e,a);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const s of t)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function a(t){const s={};return t.integrity&&(s.integrity=t.integrity),t.referrerPolicy&&(s.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?s.credentials="include":t.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(t){if(t.ep)return;t.ep=!0;const s=a(t);fetch(t.href,s)}})();const G={sequencialTransacao:"ans:sequencialTransacao",dataRegistroTransacao:"ans:dataRegistroTransacao",horaRegistroTransacao:"ans:horaRegistroTransacao",cabecalhoGuia:"ans:cabecalhoGuia",guiaPrincipal:"ans:guiaPrincipal",numeroGuiaPrestador:"ans:numeroGuiaPrestador",dadosAutorizacao:"ans:dadosAutorizacao",numeroGuiaOperadora:"ans:numeroGuiaOperadora",dataAutorizacao:"ans:dataAutorizacao",senha:"ans:senha",dataValidadeSenha:"ans:dataValidadeSenha",dadosBeneficiario:"ans:dadosBeneficiario",numeroCarteira:"ans:numeroCarteira",nomeBeneficiario:"ans:nomeBeneficiario",CNS:"ans:CNS",atendimentoRN:"ans:atendimentoRN",dadosSolicitante:"ans:dadosSolicitante",nomeContratadoSolicitante:"ans:nomeContratadoSolicitante",profissionalSolicitante:"ans:profissionalSolicitante",nomeProfissional:"ans:nomeProfissional",codigoConselhoProfissional:"ans:codigoConselhoProfissional",numeroConselhoProfissional:"ans:numeroConselhoProfissional",UFConselho:"ans:UFConselho",CBO:"ans:CBO",dadosSolicitacao:"ans:dadosSolicitacao",dataSolicitacao:"ans:dataSolicitacao",caraterAtendimento:"ans:caraterAtendimento",indicacaoClinica:"ans:indicacaoClinica",dadosExecutante:"ans:dadosExecutante",CNES:"ans:CNES",dadosAtendimento:"ans:dadosAtendimento",tipoAtendimento:"ans:tipoAtendimento",regimeAtendimento:"ans:regimeAtendimento",tipoConsulta:"ans:tipoConsulta",observacao:"ans:observacao",valorTotalProcedimentos:"ans:valorTotalProcedimentos",valorTotalTaxasAlugueis:"ans:valorTotalTaxasAlugueis",valorTotalMateriais:"ans:valorTotalMateriais",valorTotalMedicamentos:"ans:valorTotalMedicamentos",valorTotalGeral:"ans:valorTotalGeral",procedimentosExecutados:"ans:procedimentosExecutados",procedimentoExecutado:"ans:procedimentoExecutado",sequencialItem:"ans:sequencialItem",dataExecucao:"ans:dataExecucao",horaInicial:"ans:horaInicial",horaFinal:"ans:horaFinal",procedimento:"ans:procedimento",codigoTabela:"ans:codigoTabela",codigoProcedimento:"ans:codigoProcedimento",descricaoProcedimento:"ans:descricaoProcedimento",quantidadeExecutada:"ans:quantidadeExecutada",valorUnitario:"ans:valorUnitario",valorTotal:"ans:valorTotal",reducaoAcrescimo:"ans:reducaoAcrescimo",padrao:"ans:Padrao"},$="http://www.ans.gov.br/padroes/tiss/schemas",S={...G,guiaSP_SADT:"ans:guiaSP-SADT"},I={"4.00.00":{nome:"TISS 4.00.00",namespace:$,xpath:S},"4.00.01":{nome:"TISS 4.00.01",namespace:$,xpath:S},"4.01.00":{nome:"TISS 4.01.00",namespace:$,xpath:S},"4.02.00":{nome:"TISS 4.02.00",namespace:$,xpath:S},"4.03.00":{nome:"TISS 4.03.00",namespace:$,xpath:S}};function M(m){return m in I}const R={0:"DEBUG",1:"INFO",2:"WARN",3:"ERROR",4:"NONE"},b=class b{constructor(){v(this,"level",0);v(this,"logs",[]);v(this,"maxLogs",1e3)}static getInstance(){return b.instance||(b.instance=new b),b.instance}setLevel(e){this.level=e}getLevel(){return this.level}getLogs(){return this.logs}clear(){this.logs.length=0}shouldLog(e){return e>=this.level}addLog(e,a,o,t){if(!this.shouldLog(e))return;const s={level:e,message:a,data:o,timestamp:new Date,source:t};this.logs.push(s),this.logs.length>this.maxLogs&&this.logs.shift();const i=`[${R[e]}] [${t}]`,n=o!==void 0?[o]:[];switch(e){case 0:console.debug(i,a,...n);break;case 1:console.info(i,a,...n);break;case 2:console.warn(i,a,...n);break;case 3:console.error(i,a,...n);break}}debug(e,a,o="App"){this.addLog(0,e,a,o)}info(e,a,o="App"){this.addLog(1,e,a,o)}warn(e,a,o="App"){this.addLog(2,e,a,o)}error(e,a,o="App"){this.addLog(3,e,a,o)}};v(b,"instance");let B=b;const L=B.getInstance();function N(m){return{debug:(e,a)=>L.debug(e,a,m),info:(e,a)=>L.info(e,a,m),warn:(e,a)=>L.warn(e,a,m),error:(e,a)=>L.error(e,a,m)}}const x=N("XmlParser");class O{constructor(e){v(this,"xpath");this.xpath=e.xpath,x.debug("XmlParser inicializado",{versao:e.nome})}parse(e){x.debug("Iniciando parse do XML",{tamanho:e.length});const a=this.parseXmlString(e),o=this.findElementsByLocalName(a,this.xpath.guiaSP_SADT);x.info(`Encontradas ${o.length} guias`);const t=this.findElementsByLocalName(a,"mensagemTISS")[0];let s="",i="",n="";if(t){const d=this.findElementsByLocalName(t,"cabecalho")[0];if(d){const h=this.findElementsByLocalName(d,"identificacaoTransacao")[0];h&&(s=this.getText(h,this.xpath.sequencialTransacao),i=this.getText(h,this.xpath.dataRegistroTransacao),n=this.getText(h,this.xpath.horaRegistroTransacao))}}const r=o.map(d=>this.extrairGuia(d,{sequencialTransacao:s,dataRegistroTransacao:i,horaRegistroTransacao:n})),l=r.reduce((d,h)=>d+this.parseNumber(h.valores.valorTotalGeral),0);return x.info(`Parse concluido. Total guias: ${r.length}, Total valor: ${l}`),{guias:r,totalGeral:l,totalGuias:r.length}}extrairVersaoArquivo(e){var t;x.debug("Extraindo versao do arquivo");const a=this.parseXmlString(e),o=this.findElementsByLocalName(a,this.xpath.padrao);if(o.length>0){const s=((t=o[0].textContent)==null?void 0:t.trim())??"";return x.info(`Versao encontrada: "${s}"`),s}return x.warn("Elemento de versao nao encontrado no XML"),""}parseXmlString(e){var s;const o=new DOMParser().parseFromString(e,"text/xml"),t=o.querySelector("parsererror");return t&&x.warn("XML contém erros de parsing",{erro:(s=t.textContent)==null?void 0:s.substring(0,200)}),o}getLocalName(e){const a=e.indexOf(":");return a>=0?e.substring(a+1):e}findElementsByLocalName(e,a){if(!a)return[];const o=this.getLocalName(a),t=e.getElementsByTagName("*"),s=[];for(let i=0;i<t.length;i++)t[i].localName===o&&s.push(t[i]);return s}getText(e,a){var s;if(!a)return"";const o=this.getLocalName(a),t=e.getElementsByTagName("*");for(let i=0;i<t.length;i++)if(t[i].localName===o)return((s=t[i].textContent)==null?void 0:s.trim())??"";return""}parseNumber(e){const a=parseFloat(e);return Number.isFinite(a)?a:0}extrairGuia(e,a){const o=this.findElementsByLocalName(e,"cabecalhoGuia")[0],t=this.findElementsByLocalName(e,"dadosBeneficiario")[0],s={numeroCarteira:t?this.getText(t,"numeroCarteira"):"",atendimentoRN:t?this.getText(t,"atendimentoRN"):""},i=this.findElementsByLocalName(e,"dadosSolicitante")[0];let n={nomeProfissional:"",codigoConselhoProfissional:"",numeroConselhoProfissional:"",UFConselho:"",CBO:""},r="";if(i){const T=this.findElementsByLocalName(i,"contratadoSolicitante")[0];T&&(r=this.getText(T,"codigoPrestadorNaOperadora"));const C=this.findElementsByLocalName(i,"profissionalSolicitante")[0];C&&(n={nomeProfissional:this.getText(C,"nomeProfissional"),codigoConselhoProfissional:this.getText(C,"conselhoProfissional"),numeroConselhoProfissional:this.getText(C,"numeroConselhoProfissional"),UFConselho:this.getText(C,"UF"),CBO:this.getText(C,"CBOS")})}const l=this.findElementsByLocalName(e,"dadosSolicitacao")[0],d=this.findElementsByLocalName(e,"dadosExecutante")[0];let h="",u="";if(d){const T=this.findElementsByLocalName(d,"contratadoExecutante")[0];T&&(h=this.getText(T,"codigoPrestadorNaOperadora")),u=this.getText(d,"CNES")}const c=this.findElementsByLocalName(e,"dadosAtendimento")[0],g=this.findElementsByLocalName(e,"dadosAutorizacao")[0],p=this.findElementsByLocalName(e,"valorTotal").find(T=>this.getText(T,"valorTotalGeral")!=="")??null,y={valorProcedimentos:p?this.getText(p,"valorProcedimentos"):"",valorDiarias:p?this.getText(p,"valorDiarias"):"",valorTaxasAlugueis:p?this.getText(p,"valorTaxasAlugueis"):"",valorMateriais:p?this.getText(p,"valorMateriais"):"",valorMedicamentos:p?this.getText(p,"valorMedicamentos"):"",valorTotalGeral:p?this.getText(p,"valorTotalGeral"):""},P={sequencialTransacao:a.sequencialTransacao,dataRegistroTransacao:a.dataRegistroTransacao,horaRegistroTransacao:a.horaRegistroTransacao,guiaPrincipal:o?this.getText(o,"guiaPrincipal"):"",numeroGuiaPrestador:o?this.getText(o,"numeroGuiaPrestador"):"",registroANS:o?this.getText(o,"registroANS"):"",numeroGuiaOperadora:g?this.getText(g,"numeroGuiaOperadora"):"",dataAutorizacao:g?this.getText(g,"dataAutorizacao"):"",senha:g?this.getText(g,"senha"):"",dataValidadeSenha:g?this.getText(g,"dataValidadeSenha"):"",dadosBeneficiario:s,profissionalSolicitante:n,codigoContratadoSolicitante:r,nomeContratadoSolicitante:i?this.getText(i,"nomeContratadoSolicitante"):"",dataSolicitacao:l?this.getText(l,"dataSolicitacao"):"",caraterAtendimento:l?this.getText(l,"caraterAtendimento"):"",indicacaoClinica:l?this.getText(l,"indicacaoClinica"):"",codigoContratadoExecutante:h,CNES:u,tipoAtendimento:c?this.getText(c,"tipoAtendimento"):"",regimeAtendimento:c?this.getText(c,"regimeAtendimento"):"",tipoConsulta:c?this.getText(c,"tipoConsulta"):"",indicacaoAcidente:c?this.getText(c,"indicacaoAcidente"):"",observacao:this.getText(e,"observacao"),valores:y,procedimentos:this.extrairProcedimentos(e)};return x.debug("Guia extraida",{guiaPrincipal:P.guiaPrincipal,numeroCarteira:P.dadosBeneficiario.numeroCarteira,valorTotalGeral:P.valores.valorTotalGeral,procedimentos:P.procedimentos.length}),P}extrairProcedimentos(e){const a=this.findElementsByLocalName(e,this.xpath.procedimentoExecutado);return x.debug(`Encontrados ${a.length} procedimentos`),a.map(o=>({sequencialItem:this.getText(o,this.xpath.sequencialItem),dataExecucao:this.getText(o,this.xpath.dataExecucao),horaInicial:this.getText(o,this.xpath.horaInicial),horaFinal:this.getText(o,this.xpath.horaFinal),codigoTabela:this.getText(o,this.xpath.codigoTabela),codigoProcedimento:this.getText(o,this.xpath.codigoProcedimento),descricaoProcedimento:this.getText(o,this.xpath.descricaoProcedimento),quantidadeExecutada:this.getText(o,this.xpath.quantidadeExecutada),valorUnitario:this.getText(o,this.xpath.valorUnitario),valorTotal:this.getText(o,this.xpath.valorTotal),reducaoAcrescimo:this.getText(o,this.xpath.reducaoAcrescimo)}))}}const E=N("UIManager");function f(m){return m.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function D(m){const a=new TextDecoder("ascii").decode(m.slice(0,200)).match(/encoding\s*=\s*["']([^"']+)["']/i);if(a){const o=a[1].trim().toLowerCase();return E.debug(`Encoding detectado no prólogo XML: ${o}`),o==="latin1"||o==="latin-1"?"iso-8859-1":o}return E.debug("Encoding não detectado no prólogo, usando iso-8859-1"),"iso-8859-1"}function F(m){var a;const e=m.match(/<(?:ans:)?Padrao>([^<]+)<\/(?:ans:)?Padrao>/);return((a=e==null?void 0:e[1])==null?void 0:a.trim())??null}class k{constructor(){v(this,"lotes",[]);v(this,"arquivoAtual",0);v(this,"currentPage",1);v(this,"searchTerm","");v(this,"itemsPerPage",20);v(this,"elements")}init(){const e=window.bootstrap;this.elements={fileInput:document.getElementById("fileInput"),importarBtn:document.getElementById("btnImportar"),fileName:document.getElementById("fileName"),results:document.getElementById("results"),uploadSection:document.getElementById("uploadSection"),totalGuias:document.getElementById("totalGuias"),valorTotalGeral:document.getElementById("valorTotalGeral"),valorTotalArquivo:document.getElementById("valorTotalArquivo"),nomeArquivo:document.getElementById("nomeArquivo"),versaoBadge:document.getElementById("versaoBadge"),guiasTable:document.getElementById("guiasTable"),pagination:document.getElementById("pagination"),tabsContainer:document.getElementById("tabsContainer"),fileTabs:document.getElementById("fileTabs"),modalGuia:e.Modal.getOrCreateInstance(document.getElementById("modalGuia")),modalErro:e.Modal.getOrCreateInstance(document.getElementById("modalErro")),modalImportacao:e.Modal.getOrCreateInstance(document.getElementById("modalImportacao")),versaoArquivo:document.getElementById("versaoArquivo"),versaoSelecionadaEl:document.getElementById("versaoSelecionada"),importacaoContent:document.getElementById("importacaoContent"),clearBtn:document.getElementById("clearBtn"),dropZone:document.getElementById("dropZone"),searchInput:document.getElementById("searchInput"),emptyState:document.getElementById("emptyState"),loadingOverlay:document.getElementById("loadingOverlay"),loadingText:document.getElementById("loadingText"),loadingProgress:document.getElementById("loadingProgress"),loadingDetail:document.getElementById("loadingDetail"),toastNotification:e.Toast.getOrCreateInstance(document.getElementById("toastNotification")),toastBody:document.getElementById("toastBody"),itensPorPagina:document.getElementById("itensPorPagina"),totalProcedimentos:document.getElementById("totalProcedimentos"),totalQtdExecutada:document.getElementById("totalQtdExecutada"),totalGeralSection:document.getElementById("totalGeralSection"),totalGeralArquivos:document.getElementById("totalGeralArquivos"),totalGuiasGeral:document.getElementById("totalGuiasGeral"),totalProcedimentosGeral:document.getElementById("totalProcedimentosGeral"),totalQtdExecutadaGeral:document.getElementById("totalQtdExecutadaGeral"),colArquivo:document.getElementById("colArquivo")},this.setupEventListeners()}setupEventListeners(){this.elements.fileInput.addEventListener("change",()=>this.onFilesSelected()),this.elements.importarBtn.addEventListener("click",()=>this.importarXml()),this.elements.clearBtn.addEventListener("click",()=>this.limparDados());const e=this.elements.dropZone;e.addEventListener("dragover",o=>{o.preventDefault(),e.classList.add("drag-over")}),e.addEventListener("dragleave",()=>{e.classList.remove("drag-over")}),e.addEventListener("drop",o=>{o.preventDefault(),e.classList.remove("drag-over");const t=o.dataTransfer;t!=null&&t.files&&t.files.length>0&&(this.elements.fileInput.files=t.files,this.onFilesSelected())});let a;this.elements.searchInput.addEventListener("input",()=>{clearTimeout(a),a=setTimeout(()=>{this.searchTerm=this.elements.searchInput.value.trim().toLowerCase(),this.currentPage=1,this.renderTable(),this.renderPagination()},250)}),this.elements.itensPorPagina.addEventListener("change",()=>{this.itemsPerPage=parseInt(this.elements.itensPorPagina.value,10),this.currentPage=1,this.renderTable(),this.renderPagination()})}onFilesSelected(){const e=this.elements.fileInput.files;!e||e.length===0||(e.length===1?this.elements.fileName.textContent=`Arquivo selecionado: ${e[0].name}`:this.elements.fileName.textContent=`${e.length} arquivos selecionados`)}showLoading(e){this.elements.loadingText.textContent=e,this.elements.loadingProgress.style.width="0%",this.elements.loadingDetail.textContent="",this.elements.loadingOverlay.classList.remove("d-none")}updateLoading(e,a){this.elements.loadingProgress.style.width=`${e}%`,this.elements.loadingDetail.textContent=a}hideLoading(){this.elements.loadingOverlay.classList.add("d-none")}showToast(e,a){const o=document.getElementById("toastNotification");o.className=`toast align-items-center border-0 text-bg-${a}`,this.elements.toastBody.textContent=e,this.elements.toastNotification.show()}lerArquivo(e){return new Promise((a,o)=>{const t=new FileReader;t.onload=()=>{const s=t.result,i=D(s),n=new TextDecoder(i);a(n.decode(s))},t.onerror=()=>o(new Error(`Falha ao ler arquivo: ${e.name}`)),t.readAsArrayBuffer(e)})}async processarArquivo(e){const a=await this.lerArquivo(e),o=F(a);if(!o)throw new Error("Versão TISS não encontrada no arquivo");if(!M(o))throw new Error(`Versão "${o}" não suportada. Suportadas: ${Object.keys(I).join(", ")}`);const t=I[o],i=new O(t).parse(a);return E.debug(`Parse concluído: ${i.guias.length} guias, versão ${o}`),{guias:i.guias,totalGeral:i.totalGeral,versao:o}}async importarXml(){const e=this.elements.fileInput.files;if(!e||e.length===0){this.showToast("Selecione ao menos um arquivo XML.","warning");return}const a=Array.from(e).filter(i=>i.name.toLowerCase().endsWith(".xml"));if(a.length===0){this.showToast("Nenhum arquivo XML encontrado na seleção.","warning");return}E.info(`Importando ${a.length} arquivo(s)`),this.showLoading("Importando arquivos..."),this.lotes=[],this.arquivoAtual=0,this.currentPage=1,this.searchTerm="",this.itemsPerPage=20,this.elements.searchInput.value="",this.elements.itensPorPagina.value="20";const o=[],t=[];for(let i=0;i<a.length;i++){const n=a[i],r=Math.round((i+1)/a.length*100);this.updateLoading(r,`${i+1} de ${a.length}: ${n.name}`);try{const l=await this.processarArquivo(n);if(l.guias.length===0){t.push({nome:n.name,motivo:"Nenhuma guia SP/SADT encontrada"});continue}this.lotes.push({nomeArquivo:n.name,versao:l.versao,guias:l.guias,totalArquivo:l.totalGeral}),o.push({nome:n.name,guias:l.guias.length,total:l.totalGeral,versao:l.versao}),E.info(`${n.name}: ${l.guias.length} guias, R$ ${l.totalGeral}`)}catch(l){const d=l instanceof Error?l.message:"Erro desconhecido";E.error(`Erro: ${n.name}`,{erro:d}),t.push({nome:n.name,motivo:d})}}if(this.hideLoading(),E.info("Importação concluída",{sucesso:o.length,erros:t.length,totalGeral:this.lotes.reduce((i,n)=>i+n.totalArquivo,0)}),this.lotes.length===0){this.mostrarErro(t);return}this.elements.clearBtn.classList.remove("d-none"),this.elements.uploadSection.classList.add("d-none"),this.mostrarModalImportacao(o,t),this.renderResults();const s=this.lotes.reduce((i,n)=>i+n.guias.length,0);this.showToast(`${o.length} arquivo(s) importado(s) — ${s} guias`,t.length>0?"warning":"success")}mostrarErro(e){this.elements.versaoArquivo.textContent=e.length>0?e.map(a=>`${a.nome}: ${a.motivo}`).join("; "):"Nenhum arquivo válido",this.elements.versaoSelecionadaEl.textContent=`Suportadas: ${Object.keys(I).join(", ")}`,this.elements.modalErro.show()}mostrarModalImportacao(e,a){const o=this.lotes.reduce((i,n)=>i+n.totalArquivo,0),t=this.lotes.reduce((i,n)=>i+n.guias.length,0);let s="";if(e.length>0){const i=e.map(n=>`
        <tr>
          <td style="word-break:break-word" title="${f(n.nome)}">${f(n.nome)}</td>
          <td><span class="badge bg-primary bg-opacity-10 text-primary version-badge">${f(n.versao)}</span></td>
          <td class="text-center">${n.guias}</td>
          <td class="text-end">R$ ${this.formatCurrency(n.total)}</td>
        </tr>
      `).join("");s+=`
        <div class="d-flex align-items-center gap-3 mb-3 p-3 rounded-3" style="background: #d1e7dd;">
          <div>
            <i class="bi bi-check-circle-fill text-success" style="font-size:1.75rem"></i>
          </div>
          <div class="flex-grow-1">
            <div class="fw-semibold text-success-emphasis">${e.length} arquivo(s) importado(s)</div>
            <div class="text-success-emphasis small">${t} guias &middot; R$ ${this.formatCurrency(o)}</div>
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
            <tbody>${i}</tbody>
          </table>
        </div>
      `}if(a.length>0){const i=a.map(n=>`<li class="mb-1"><strong>${f(n.nome)}</strong>: ${f(n.motivo)}</li>`).join("");s+=`
        <div class="alert alert-danger mt-3 mb-0">
          <div class="fw-bold mb-2"><i class="bi bi-exclamation-triangle me-1"></i>${a.length} arquivo(s) com erro</div>
          <ul class="mb-0 ps-3 small">${i}</ul>
        </div>
      `}this.elements.importacaoContent.innerHTML=s,this.elements.modalImportacao.show()}limparDados(){this.lotes=[],this.arquivoAtual=0,this.currentPage=1,this.searchTerm="",this.itemsPerPage=20,this.elements.fileInput.value="",this.elements.fileName.textContent="",this.elements.searchInput.value="",this.elements.itensPorPagina.value="20",this.elements.results.classList.add("d-none"),this.elements.uploadSection.classList.remove("d-none"),this.elements.clearBtn.classList.add("d-none"),this.showToast("Dados limpos com sucesso.","info")}renderResults(){this.renderTabs(),this.renderSummary(),this.renderTable(),this.renderPagination(),this.elements.results.classList.remove("d-none")}renderTabs(){const e=this.elements.tabsContainer,a=this.elements.fileTabs;if(a.innerHTML="",this.lotes.length<=1){e.classList.add("d-none");return}e.classList.remove("d-none"),this.lotes.forEach((o,t)=>{const s=document.createElement("li");s.className="nav-item";const i=document.createElement("a");i.className=`nav-link${t===this.arquivoAtual?" active":""}`,i.href="#",i.title=`${o.nomeArquivo} (${o.versao}) — R$ ${this.formatCurrency(o.totalArquivo)}`;const n=document.createElement("i");n.className="bi bi-file-earmark me-1",i.appendChild(n),i.appendChild(document.createTextNode(`Arq. ${t+1}`)),i.addEventListener("click",r=>{r.preventDefault(),this.selecionarArquivo(t)}),s.appendChild(i),a.appendChild(s)})}selecionarArquivo(e){this.arquivoAtual=e,this.currentPage=1,this.renderResults()}get filteredGuias(){var o;const e=((o=this.lotes[this.arquivoAtual])==null?void 0:o.guias)??[];if(!this.searchTerm)return e.slice();const a=this.searchTerm;return e.filter(t=>t.guiaPrincipal.toLowerCase().includes(a)||t.numeroGuiaPrestador.toLowerCase().includes(a)||t.dadosBeneficiario.numeroCarteira.toLowerCase().includes(a)||t.profissionalSolicitante.nomeProfissional.toLowerCase().includes(a)||t.nomeContratadoSolicitante.toLowerCase().includes(a)||t.senha.toLowerCase().includes(a)||t.CNES.toLowerCase().includes(a)||t.procedimentos.some(s=>s.codigoProcedimento.toLowerCase().includes(a)||s.descricaoProcedimento.toLowerCase().includes(a)))}get totalGeral(){return this.lotes.reduce((e,a)=>e+a.totalArquivo,0)}renderSummary(){const e=this.lotes[this.arquivoAtual],a=(e==null?void 0:e.totalArquivo)??0,o=(e==null?void 0:e.nomeArquivo)??"",t=(e==null?void 0:e.versao)??"",s=o.replace(/\.(xml|XML)$/,"");this.elements.nomeArquivo.textContent=s,this.elements.nomeArquivo.title=o,this.elements.versaoBadge.textContent=`TISS ${t}`,this.elements.valorTotalArquivo.textContent=`R$ ${this.formatCurrency(a)}`;const i=(e==null?void 0:e.guias)??[],n=i.reduce((l,d)=>l+d.procedimentos.length,0),r=i.reduce((l,d)=>l+d.procedimentos.reduce((h,u)=>h+(parseInt(u.quantidadeExecutada)||0),0),0);if(this.elements.totalGuias.textContent=String(i.length),this.elements.totalProcedimentos.textContent=String(n),this.elements.totalQtdExecutada.textContent=String(r),this.lotes.length>1){this.elements.colArquivo.className="col-md-6",this.elements.totalGeralSection.classList.remove("d-none"),this.elements.totalGeralArquivos.textContent=`${this.lotes.length} arquivos importados`,this.elements.valorTotalGeral.textContent=`R$ ${this.formatCurrency(this.totalGeral)}`;const l=this.lotes.flatMap(u=>u.guias),d=l.reduce((u,c)=>u+c.procedimentos.length,0),h=l.reduce((u,c)=>u+c.procedimentos.reduce((g,A)=>g+(parseInt(A.quantidadeExecutada)||0),0),0);this.elements.totalGuiasGeral.textContent=String(l.length),this.elements.totalProcedimentosGeral.textContent=String(d),this.elements.totalQtdExecutadaGeral.textContent=String(h)}else this.elements.colArquivo.className="col-12",this.elements.totalGeralSection.classList.add("d-none")}renderTable(){var n;const e=this.elements.guiasTable;e.innerHTML="";const a=this.filteredGuias;if(a.length===0){this.elements.emptyState.classList.remove("d-none");return}this.elements.emptyState.classList.add("d-none");const o=(this.currentPage-1)*this.itemsPerPage,t=o+this.itemsPerPage,s=a.slice(o,t),i=((n=this.lotes[this.arquivoAtual])==null?void 0:n.guias)??[];s.forEach(r=>{const l=i.indexOf(r),d=document.createElement("tr"),h=[[r.guiaPrincipal,""],[r.numeroGuiaPrestador,""],[r.dadosBeneficiario.numeroCarteira,""],[this.formatDate(r.dataAutorizacao)||"-",""],[this.formatCurrency(parseFloat(r.valores.valorTotalGeral)||0),"text-end"]];for(const[A,p]of h){const y=document.createElement("td");y.textContent=A,p&&(y.className=p),d.appendChild(y)}const u=document.createElement("td");u.className="text-center";const c=document.createElement("button");c.className="btn btn-sm btn-outline-primary rounded-pill",c.title="Ver detalhes";const g=document.createElement("i");g.className="bi bi-eye",c.appendChild(g),c.addEventListener("click",()=>this.openModal(l,this.arquivoAtual)),u.appendChild(c),d.appendChild(u),e.appendChild(d)})}renderPagination(){const e=this.filteredGuias,a=Math.ceil(e.length/this.itemsPerPage),o=this.elements.pagination;if(o.innerHTML="",a<=1)return;const t=(r,l,d,h)=>{const u=document.createElement("li");u.className=`page-item${d?" active":""}${h?" disabled":""}`;const c=document.createElement("a");return c.className="page-link",c.href="#",c.textContent=l,h||c.addEventListener("click",g=>{g.preventDefault(),this.changePage(r)}),u.appendChild(c),u};o.appendChild(t(this.currentPage-1,"‹",!1,this.currentPage===1));const s=5;let i=Math.max(1,this.currentPage-Math.floor(s/2));const n=Math.min(a,i+s-1);if(i=Math.max(1,n-s+1),i>1&&(o.appendChild(t(1,"1",!1,!1)),i>2)){const r=document.createElement("li");r.className="page-item disabled",r.innerHTML='<span class="page-link">&hellip;</span>',o.appendChild(r)}for(let r=i;r<=n;r++)o.appendChild(t(r,String(r),r===this.currentPage,!1));if(n<a){if(n<a-1){const r=document.createElement("li");r.className="page-item disabled",r.innerHTML='<span class="page-link">&hellip;</span>',o.appendChild(r)}o.appendChild(t(a,String(a),!1,!1))}o.appendChild(t(this.currentPage+1,"›",!1,this.currentPage===a))}changePage(e){this.currentPage=e,this.renderTable(),this.renderPagination()}openModal(e,a){const o=this.lotes[a];if(!o)return;const t=o.guias[e];if(!t)return;const s=document.getElementById("modalBody"),i=this.generateProceduresTable(t);s.innerHTML=`
      <div class="d-flex flex-wrap align-items-center gap-2 mb-4 pb-3" style="border-bottom: 1px solid #e9ecef;">
        <span class="badge bg-primary bg-opacity-10 text-primary version-badge">${f(o.versao)}</span>
        <span class="badge bg-light text-dark border version-badge" title="${f(o.nomeArquivo)}">
          <i class="bi bi-file-earmark me-1"></i>${f(o.nomeArquivo)}
        </span>
        <span class="badge bg-light text-dark border version-badge">
          Guia ${e+1} de ${o.guias.length}
        </span>

      </div>

      <div class="detail-section">
        <h6><i class="bi bi-hash me-1"></i>Transação</h6>
        <div class="row">
          ${this.field("Sequencial",t.sequencialTransacao)}
          ${this.field("Data Registro",this.formatDate(t.dataRegistroTransacao))}
          ${this.field("Hora Registro",t.horaRegistroTransacao)}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-card-heading me-1"></i>Cabeçalho</h6>
        <div class="row">
          ${this.field("Registro ANS",t.registroANS)}
          ${this.field("Guia Principal",t.guiaPrincipal)}
          ${this.field("Nº Guia Prestador",t.numeroGuiaPrestador)}
          ${this.field("Nº Guia Operadora",t.numeroGuiaOperadora)}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-person-badge me-1"></i>Beneficiário</h6>
        <div class="row">
          ${this.field("Nº Carteira",t.dadosBeneficiario.numeroCarteira)}
          ${this.field("Atendimento RN",t.dadosBeneficiario.atendimentoRN)}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-key me-1"></i>Autorização</h6>
        <div class="row">
          ${this.field("Data Autorização",this.formatDate(t.dataAutorizacao))}
          ${this.field("Senha",t.senha)}
          ${this.field("Validade da Senha",this.formatDate(t.dataValidadeSenha))}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-person me-1"></i>Solicitante</h6>
        <div class="row">
          ${this.field("Contratado",t.nomeContratadoSolicitante,"col-md-6")}
          ${this.field("Código Contratado",t.codigoContratadoSolicitante,"col-md-6")}
          ${this.field("Profissional",t.profissionalSolicitante.nomeProfissional,"col-md-6")}
          ${this.field("Conselho",t.profissionalSolicitante.codigoConselhoProfissional&&t.profissionalSolicitante.numeroConselhoProfissional?`${t.profissionalSolicitante.codigoConselhoProfissional} - ${t.profissionalSolicitante.numeroConselhoProfissional}/${t.profissionalSolicitante.UFConselho}`:"","col-md-6")}
          ${this.field("CBO",t.profissionalSolicitante.CBO)}
          ${this.field("Data Solicitação",this.formatDate(t.dataSolicitacao))}
          ${this.field("Caráter Atendimento",t.caraterAtendimento)}
          ${this.field("Indicação Clínica",t.indicacaoClinica,"col-md-6")}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-hospital me-1"></i>Executante</h6>
        <div class="row">
          ${this.field("Código na Operadora",t.codigoContratadoExecutante,"col-md-6")}
          ${this.field("CNES",t.CNES,"col-md-6")}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-clipboard2-pulse me-1"></i>Atendimento</h6>
        <div class="row">
          ${this.field("Tipo Atendimento",t.tipoAtendimento)}
          ${this.field("Indicação Acidente",t.indicacaoAcidente)}
          ${this.field("Regime Atendimento",t.regimeAtendimento)}
          ${this.field("Tipo Consulta",t.tipoConsulta)}
          ${this.field("Observação",t.observacao,"col-12")}
        </div>
      </div>

      <div class="detail-section">
        <h6><i class="bi bi-currency-dollar me-1"></i>Valores</h6>
        <div class="row">
          ${this.fieldCurrency("Procedimentos",t.valores.valorProcedimentos)}
          ${this.fieldCurrency("Diárias",t.valores.valorDiarias)}
          ${this.fieldCurrency("Taxas/Aluguéis",t.valores.valorTaxasAlugueis)}
          ${this.fieldCurrency("Materiais",t.valores.valorMateriais)}
          ${this.fieldCurrency("Medicamentos",t.valores.valorMedicamentos)}
          ${this.fieldCurrency("Total Geral",t.valores.valorTotalGeral,"col-md-4","",!0)}
        </div>
      </div>

      <div class="detail-section mb-0">
        <h6><i class="bi bi-list-check me-1"></i>Procedimentos Executados (${t.procedimentos.length})</h6>
        ${i}
      </div>
    `,this.elements.modalGuia.show()}generateProceduresTable(e){if(e.procedimentos.length===0)return'<p class="text-muted small">Nenhum procedimento encontrado.</p>';const a=e.procedimentos.map(t=>`
      <tr>
        <td class="text-center text-muted">${f(t.sequencialItem)}</td>
        <td>${f(t.codigoTabela)}-${f(t.codigoProcedimento)}</td>
        <td>${f(t.descricaoProcedimento)}</td>
        <td class="text-center">${parseInt(t.quantidadeExecutada)||0}</td>
        <td class="text-center">${f(this.formatNumber(t.reducaoAcrescimo))}</td>
        <td class="text-end">${this.formatCurrency(parseFloat(t.valorUnitario)||0)}</td>
        <td class="text-end">${this.formatCurrency(parseFloat(t.valorTotal)||0)}</td>
      </tr>
    `).join(""),o="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.04em;color:#6c757d;font-weight:600;padding:0.5rem 0.4rem";return`
      <div class="table-responsive rounded-2 border">
        <table class="table table-sm table-hover align-middle mb-0">
          <thead style="background:#f8f9fa;">
            <tr>
              <th class="text-center" style="${o};width:40px">#</th>
              <th style="${o};min-width:120px">Código</th>
              <th style="${o};min-width:200px">Descrição</th>
              <th class="text-center" style="${o};width:45px">Qtd</th>
              <th class="text-center" style="${o};width:70px">Red./Acr.</th>
              <th class="text-end" style="${o};width:90px">Valor Unit.</th>
              <th class="text-end" style="${o};width:90px">Valor Total</th>
            </tr>
          </thead>
          <tbody>${a}</tbody>
          <tfoot>
            <tr style="background: var(--tiss-primary-soft);">
              <td colspan="6" class="text-end fw-semibold" style="font-size:0.85rem;color:#374151">Total da Guia</td>
              <td class="text-end" style="font-size:0.85rem;color:var(--tiss-primary)">R$ ${this.formatCurrency(parseFloat(e.valores.valorTotalGeral)||0)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `}formatCurrency(e){return e.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}formatDate(e){if(!e||e.length!==10)return"";const a=e.split("-");return a.length===3?`${a[2]}/${a[1]}/${a[0]}`:e}formatNumber(e){if(!e)return"";const a=parseFloat(e);return Number.isFinite(a)?Number.isInteger(a)?String(a):a.toString():e}field(e,a,o="col-md-4"){return a?`
      <div class="${o} detail-field">
        <strong>${e}</strong>
        <span>${f(a)}</span>
      </div>`:""}fieldCurrency(e,a,o="col-md-4",t="",s=!1){if(!a)return"";const i=parseFloat(a);if(!Number.isFinite(i)||i===0&&!s)return"";const n=`R$ ${this.formatCurrency(i)}`;return`
      <div class="${o} detail-field">
        <strong>${e}</strong>
        <span${t?` class="${t}"`:""}>${f(n)}</span>
      </div>`}}document.addEventListener("DOMContentLoaded",()=>{new k().init()});
