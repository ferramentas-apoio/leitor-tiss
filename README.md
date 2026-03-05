# Leitor TISS

[![Deploy GitHub Pages](https://github.com/ferramentas-apoio/leitor-tiss/actions/workflows/deploy.yml/badge.svg)](https://github.com/ferramentas-apoio/leitor-tiss/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Acessar-brightgreen)](https://ferramentas-apoio.github.io/leitor-tiss/)

**Leitor TISS** é uma ferramenta web para leitura e visualização de arquivos XML no padrão TISS (Troca de Informação de Saúde Suplementar), utilizado na comunicação entre prestadores de serviços de saúde e operadoras de planos de saúde no Brasil.

## Acessar a aplicação

🔗 **https://ferramentas-apoio.github.io/leitor-tiss/**

---

## O que é o padrão TISS?

O TISS é um padrão nacional estabelecido pela Agência Nacional de Saúde Suplementar (ANS) para a troca de informações entre prestadores de serviços de saúde e operadoras de planos de saúde. Este padrão define a estrutura dos dados que devem ser enviados nas solicitações de autorização, eletivas e de urgência, bem como nas respostas de autorização.

## Funcionalidades

- **Importação de arquivos XML**: Arraste e solte ou selecione um ou múltiplos arquivos XML no padrão TISS
- **Suporte a múltiplas versões**: Compatível com as versões TISS 4.00.00 a 4.03.00
- **Visualização de guias**: Exibe todas as guias SP/SADT presentes nos arquivos importados
- **Informações detalhadas**: Mostra número da guia, número da carteira do beneficiário, data de autorização, valor total, entre outras informações
- **Busca e filtragem**: Campo de busca para encontrar guias específicas por número ou carteira
- **Paginação**: Navegação entre as guias com controle de itens por página
- **Totalização**: Resumo com totais de guias, procedimentos, quantidades executadas e valores
- **Interface responsiva**: Layout adaptável para diferentes tamanhos de tela

## Tecnologias utilizadas

- **TypeScript**: Linguagem de programação com tipagem estática
- **Vite**: Ferramenta de build e desenvolvimento rápido
- **Bootstrap 5**: Framework CSS para interface responsiva

## Como usar

1. **Importar arquivo(s)**:
   - Arraste o arquivo XML para a zona de drop ou clique para selecionar
   - Você pode selecionar múltiplos arquivos de uma vez
   - Clique no botão "Importar" para processar os arquivos

2. **Visualizar resultados**:
   - Após a importação, as guias serão exibidas em uma tabela
   - Cada linha representa uma guia SP/SADT com suas principais informações

3. **Buscar guias**:
   - Use o campo de busca para filtrar por número da guia ou número da carteira

4. **Ver detalhes**:
   - Clique no botão de ações de uma guia para ver todos os detalhes
   - O modal exibirá informações completas incluindo procedimentos realizados

5. **Múltiplos arquivos**:
   - Ao importar múltiplos arquivos, use as abas para alternar entre eles
   - A seção "Total Geral" mostra a consolidação de todos os arquivos

6. **Limpar dados**:
   - Use o botão "Limpar" na navbar para remover todos os dados importados

## Como executar localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## Requisitos

- Node.js 18 ou superior
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

---

Desenvolvido para facilitar o trabalho de análise de arquivos TISS no dia a dia de profissionais da área de saúde.
