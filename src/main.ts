/**
 * Ponto de Entrada da Aplicação
 * 
 * Inicializa o controlador principal quando o DOM estiver pronto.
 */

import { ControladorGuias } from './controllers/guias.controller';

/**
 * Inicializa a aplicação quando o DOM estiver completamente carregado.
 */
document.addEventListener('DOMContentLoaded', () => {
  const controlador = new ControladorGuias();
  controlador.iniciar();
});
