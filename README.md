# Milano Inbox

Sistema de caixa de entrada de contatos - gerencie mensagens de formulários de contato dos seus sites em um lugar só.

## Funcionalidades

- 🔐 **Autenticação** - Login, cadastro e logout
- 🌐 **Gerenciamento de Sites** - Cadastre seus sites com logo personalizado
- 📬 **Caixa de Entrada** - Veja todas as mensagens recebidas de cada site
- 📊 **Status das Mensagens** - Nova, Lida, Respondida, Arquivada
- 🔍 **Busca e Filtros** - Encontre mensagens rapidamente
- 📱 **Responsivo** - Funciona bem em desktop e mobile
- 🔗 **API Pública** - Endpoint para receber mensagens de formulários externos

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (via Prisma ORM)
- **Auth**: JWT com cookies httpOnly

## Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env
```

### 3. Criar banco de dados e rodar seed

```bash
npm run db:seed
```

Isso cria:
- Banco SQLite em `prisma/dev.db`
- Usuário demo: `demo@milano.com` / `demo123`
- 3 sites demo com mensagens

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

O app vai estar em `http://localhost:3000`

### 5. Build para produção

```bash
npm run build
npm start
```

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login com email e senha |
| POST | `/api/auth/register` | Criar nova conta |
| POST | `/api/auth/logout` | Fazer logout |
| GET | `/api/auth/me` | Verificar sessão atual |

### Sites

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/sites` | Listar sites do usuário |
| POST | `/api/sites` | Criar novo site |
| GET | `/api/sites/[id]` | Ver detalhes do site |
| PUT | `/api/sites/[id]` | Editar site |
| DELETE | `/api/sites/[id]` | Excluir site |

### Mensagens

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/messages?siteId=X` | Listar mensagens do site |
| GET | `/api/messages/[id]` | Ver mensagem completa |
| PATCH | `/api/messages/[id]` | Atualizar status |

### Endpoint Público (para formulários)

```bash
POST /api/v1/submit
Header: X-Site-Token: {token_do_site}
Content-Type: application/json
```

**Exemplo de corpo:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "+55 11 99999-9999",
  "subject": "Quero um orçamento",
  "message": "Olá, gostaria de saber mais sobre..."
}
```

## Snippet HTML para o Site do Cliente

Cole isso no formulário do cliente:

```html
<form action="https://seu-dominio.com/api/v1/submit" method="POST">
  <input type="hidden" name="_token" value="mb_token_do_site">

  <label>Nome</label>
  <input type="text" name="name" required>

  <label>Email</label>
  <input type="email" name="email" required>

  <label>Telefone</label>
  <input type="tel" name="phone">

  <label>Mensagem</label>
  <textarea name="message" required></textarea>

  <!-- Honeypot anti-spam -->
  <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">

  <button type="submit">Enviar</button>
</form>
```

## Deploy

### Vercel (recomendado)

1. Conecte seu repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente:
   - `DATABASE_URL` - URL do banco (Neon, Supabase, etc.)
   - `JWT_SECRET` - Chave secreta para JWT

### Alternativas

- **Railway** - SQLite persistente + deploy automático
- **Fly.io** - Containers Docker
- **Render** - Simples e gratuito para começar

## Estrutura do Projeto

```
milano-inbox/
├── prisma/
│   ├── schema.prisma    # Definição do banco
│   ├── seed.ts          # Script de seed
│   └── dev.db           # Banco SQLite local
├── src/
│   ├── app/
│   │   ├── (auth)/      # Páginas de auth
│   │   ├── (dashboard)/ # Páginas do painel
│   │   └── api/         # API Routes
│   ├── contexts/        # React Contexts
│   └── lib/             # Utilitários
├── public/
│   └── uploads/         # Logos dos sites
└── .env                 # Variáveis de ambiente
```

## Funcionalidades Futuras (Fase 2)

- [ ] Notificação por email
- [ ] Integração WhatsApp
- [ ] Exportar CSV
- [ ] Relatórios e estatísticas
- [ ] Multi-usuário por site
- [ ] White-label

## Licença

MIT
