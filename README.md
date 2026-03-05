# Leitor TISS

[![Deploy GitHub Pages](https://github.com/ferramentas-apoio/leitor-tiss/actions/workflows/deploy.yml/badge.svg)](https://github.com/ferramentas-apoio/leitor-tiss/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Acessar-brightgreen)](https://ferramentas-apoio.github.io/leitor-tiss/)

Leitor TISS é uma ferramenta web desenvolvida para facilitar a importação e visualização de arquivos XML no padrão TISS (Troca de Informação de Saúde Suplementar), utilizado por prestadores de serviços de saúde e operadoras de planos de saúde no Brasil.

## Acessar a aplicação

A aplicação está disponível online em: **[https://ferramentas-apoio.github.io/leitor-tiss/](https://ferramentas-apoio.github.io/leitor-tiss/)**

## O que é o padrão TISS?

O TISS é um padrão nacional estabelecido pela Agência Nacional de Saúde Suplementar (ANS) para a troca de informações entre prestadores de serviços de saúde e operadoras de planos de saúde. Este padrão define a estrutura dos dados que devem ser enviados nas solicitações de autorização, eletivas e de urgência, bem como nas respostas de autorização.

## Funcionalidades

Esta aplicação oferece os seguintes recursos para facilitar a análise dos arquivos XML TISS:

- **Importação de arquivos XML**: Arraste e solte ou selecione um ou múltiplos arquivos XML no padrão TISS
- **Suporte a múltiplas versões**: Compatível com as versões TISS 4.00.00 a 4.03.00
- **Visualização de guias**: Exibe todas as guias SP/SADT presentes nos arquivos importados
- **Informações detalhadas**: Mostra número da guia, número da carteira do beneficiário, data de autorização, valor total, entre outras informações
- **Busca e filtragem**: Campo de busca para encontrar guias específicas por número ou carteira
- **Paginação**: Navegação entre as guias com controle de itens por página
- **Totalização**: Resumo com totais de guias, procedimentos, quantidades executadas e valores
- **Interface responsiva**: Layout adaptável para diferentes tamanhos de tela

## Tecnologias utilizadas

O projeto foi desenvolvido utilizando as seguintes tecnologias:

- **TypeScript**: Linguagem de programação com tipagem estática
- **Vite**: Ferramenta de build e desenvolvimento rápido
- **Bootstrap 5**: Framework CSS para interface responsiva
- **XMLParser**: Biblioteca para parsing de arquivos XML

## Como instalar

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

1. Certifique-se de ter o Node.js instalado em sua máquina
2. Clone o repositório ou baixe os arquivos do projeto
3. Abra o terminal na pasta do projeto
4. Execute o comando abaixo para instalar as dependências:

```bash
npm install
```

## Como executar

### Modo de desenvolvimento

Para iniciar o servidor de desenvolvimento, execute:

```bash
npm run dev
```

Após a inicialização, a aplicação estará disponível em seu navegador no endereço `http://localhost:5173`.

### Build de produção

Para gerar os arquivos otimizados para produção:

```bash
npm run build
```

Os arquivos gerados serão armazenados na pasta `dist`.

### Visualizar build de produção

Para visualizar a versão de produção localmente:

```bash
npm run preview
```

## Como usar

A utilização da ferramenta é intuitiva e segue os seguintes passos:

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

## Estrutura do projeto

A organização dos arquivos segue o padrão de projetos TypeScript com Vite:

```
leitor-tiss/
├── src/
│   ├── components/     # Componentes UI
│   ├── config/         # Configurações e constantes
│   ├── services/       # Serviços (parsing, logging)
│   ├── types/          # Definições de tipos TypeScript
│   └── main.ts         # Ponto de entrada da aplicação
├── index.html          # Arquivo HTML principal
├── package.json        # Dependências e scripts
├── tsconfig.json       # Configurações do TypeScript
└── vite.config.ts      # Configurações do Vite
```

## Requisitos

- Node.js 18 ou superior
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Licença

Este projeto está disponível para uso livre.

---

Desenvolvido para facilitar o trabalho de análise de arquivos TISS no dia a dia de profissionais da área de saúde.
