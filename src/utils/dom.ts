/**
 * Utilitários DOM
 * 
 * Helpers para manipulação segura do DOM, prevenção de XSS
 * e criação de elementos HTML.
 */

/**
 * Escapa caracteres especiais HTML para prevenir XSS.
 * Deve ser usado para QUALQUER dado externo antes de inserção no DOM.
 * 
 * @param texto - Texto potencialmente inseguro
 * @returns Texto com caracteres HTML escapados
 * 
 * @example
 * escaparHtml('<script>alert("xss")</script>'); 
 * // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
 */
export function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Cria um elemento HTML com atributos e classes.
 * 
 * @param tag - Tag HTML (ex: 'div', 'span', 'button')
 * @param opcoes - Configurações do elemento
 * @returns Elemento HTML criado
 * 
 * @example
 * const btn = criarElemento('button', {
 *   classes: ['btn', 'btn-primary'],
 *   atributos: { type: 'button', disabled: 'true' },
 *   texto: 'Clique aqui'
 * });
 */
export function criarElemento(
  tag: string,
  opcoes: {
    classes?: string[];
    atributos?: Record<string, string>;
    texto?: string;
  } = {}
): HTMLElement {
  const elemento = document.createElement(tag);

  if (opcoes.classes) {
    elemento.classList.add(...opcoes.classes);
  }

  if (opcoes.atributos) {
    Object.entries(opcoes.atributos).forEach(([chave, valor]) => {
      elemento.setAttribute(chave, valor);
    });
  }

  if (opcoes.texto !== undefined) {
    elemento.textContent = opcoes.texto;
  }

  return elemento;
}

/**
 * Limpa todo o conteúdo de um elemento DOM.
 * 
 * @param elemento - Elemento a ser limpo
 */
export function limparElemento(elemento: HTMLElement): void {
  while (elemento.firstChild) {
    elemento.removeChild(elemento.firstChild);
  }
}

/**
 * Obtém um elemento do DOM por ID com type assertion seguro.
 * Lança erro se o elemento não for encontrado.
 * 
 * @param id - ID do elemento
 * @returns Elemento tipado
 * @throws Error se o elemento não existir
 * 
 * @example
 * const input = obterElementoPorId<HTMLInputElement>('meuInput');
 */
export function obterElementoPorId<T extends HTMLElement>(id: string): T {
  const elemento = document.getElementById(id);
  if (!elemento) {
    throw new Error(`Elemento com ID "${id}" não encontrado no DOM`);
  }
  return elemento as T;
}

/**
 * Adiciona event listener com cleanup automático (para uso em hooks).
 * 
 * @param elemento - Elemento alvo
 * @param evento - Nome do evento
 * @param handler - Função handler
 * @returns Função para remover o listener
 * 
 * @example
 * const cleanup = adicionarListener(botao, 'click', handleClick);
 * // ... depois
 * cleanup();
 */
export function adicionarListener<K extends keyof HTMLElementEventMap>(
  elemento: HTMLElement,
  evento: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown
): () => void {
  elemento.addEventListener(evento, handler);
  return () => elemento.removeEventListener(evento, handler);
}
