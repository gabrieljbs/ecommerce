# Análise e Documentação do Sistema de E-commerce

## 1. Visão Geral

Este projeto é uma aplicação de **E-commerce** desenvolvida com tecnologias modernas de JavaScript/TypeScript ecosystem. O foco principal é a listagem de produtos, detalhes de produtos e gerenciamento de carrinho de compras.

## 2. Stack Tecnológico

### Frontend

- **Framework**: [Next.js 16.1.6](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **UI Component Library**: React 19.2.3
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Gerenciamento de Estado Global**: (Implícito via URL/Server Components)

### Backend / Banco de Dados

- **Banco de Dados**: PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (v0.45.1)
- **Migrações**: Drizzle Kit
- **Driver**: `pg`

## 3. Estrutura do Projeto

A estrutura segue o padrão do Next.js App Router:

- **`app/`**: Rotas da aplicação (App Router).
  - `cart/`: Página do carrinho de compras.
  - `product/`: Páginas relacionadas a produtos.
    - `page.tsx`: Listagem de todos os produtos.
    - `[slug]/page.tsx`: Página de detalhe do produto (Dinâmica).
  - `layout.tsx`: Layout raiz da aplicação.
  - `page.tsx`: Home Page (atualmente exibe "Produtos").

- **`components/`**: Componentes reutilizáveis da UI.
  - `Cart/`, `Header/`, `Nav/`: Componentes organizados por domínio.

- **`db/`**: Camada de acesso ao banco de dados.
  - `schema.ts`: Definição das tabelas e relacionamentos do Drizzle.
  - `queries/`: Funções para buscar dados (ex: `getProducts`, `getProductBySlug`).
  - `index.ts`: Configuração da conexão com o banco de dados.

- **`action/`**: Server Actions para mutações de dados.
  - `add-to-cart.ts`: Lógica para adicionar itens ao carrinho.

## 4. Modelo de Dados (Schema)

O banco de dados possui as seguintes tabelas principais definidas em `db/schema.ts`:

### `products`

- **id**: UUID (Chave Primária)
- **title**: Texto (Obrigatório)
- **description**: Texto
- **price**: Inteiro (Obrigatório - Armazenado em centavos ou menor unidade)
- **slug**: Texto (Utilizado para URLs amigáveis)
- _Nota: Atualmente, a coluna `image` é referenciada no frontend mas não consta no schema ou nas queries, causando fallback para placeholder._

### `carts`

- **id**: UUID (Chave Primária)
- **sessionId**: Texto (Para vincular o carrinho a uma sessão de usuário anônimo)
- **createdAt**: Timestamp

### `cart_items`

- **id**: UUID (Chave Primária)
- **cartId**: UUID (FK -> carts.id)
- **productId**: UUID (FK -> products.id)
- **quantity**: Inteiro (Padrão: 1)

## 5. Funcionalidades Principais

1.  **Catálogo de Produtos**:
    - Listagem de produtos em `app/product/page.tsx`.
    - Visualização detalhada em `app/product/[slug]/page.tsx`.
    - Busca de dados feita via Server Components chamando queries direto do banco (`db.execute`).

2.  **Carrinho de Compras**:
    - Adição de itens via Server Action `addToCart`.
    - Persistência em banco de dados relacional (`cart_items`).
    - Associação via `sessionId`.

## 6. Observações e Pontos de Atenção

- **Image Missing**: O código frontend (`ProductPage`) tenta acessar `product.image`, mas essa coluna não existe na tabela `products` nem é retornada pelas queries atuais (`SELECT id, title, price, slug FROM ...`). Isso resulta em imagens sempre caindo no fallback `/placeholder.svg`.
- **Raw SQL**: As queries em `db/queries/products.ts` e `get-product-by-slug.ts` utilizam `db.execute` com SQL puro ao invés da query builder do Drizzle (`db.query.products.findMany(...)`), perdendo parte da segurança de tipos que o Drizzle oferece.
- **Tipagem `any`**: Há uso de `any` no frontend (`products.map((p: any) => ...)`), o que enfraquece a segurança do TypeScript. Recomenda-se inferir os tipos a partir do Schema do Drizzle.

## 7. Como Rodar

1.  **Instalar dependências**:

    ```bash
    npm install
    ```

2.  **Configurar Banco de Dados**:
    - Certifique-se de ter um PostgreSQL rodando.
    - Configure as variáveis de ambiente em `.env` (ex: `DATABASE_URL`).
    - Rode as migrações (se houver script configurado, ex: `npx drizzle-kit push`).

3.  **Rodar servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
    Acesse http://localhost:3000
