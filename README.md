# Casa&Sabor 🏠🥗

Sistema de vendas online para produtos caseiros e hortifruti com integração ao Mercado Pago.

## 📋 Sobre o Projeto

Casa&Sabor é uma plataforma de e-commerce desenvolvida para vendas de produtos caseiros e hortifruti, oferecendo uma experiência completa de compra online com funcionalidades modernas e acessibilidade.

## ✨ Funcionalidades

### Para Clientes:
- 🛒 Catálogo de produtos caseiros e hortifruti
- 🏠 Busca automática de endereço via CEP
- 💳 Checkout integrado com Mercado Pago
- ♿ Acessibilidade com VLibras
- 📱 Interface responsiva

### Para Administradores:
- 📊 Painel administrativo completo
- ➕ CRUD de produtos (Criar, Ler, Atualizar, Deletar)
- 📋 Visualização de pedidos aprovados

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express.js
- **Banco de Dados**: MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **Pagamentos**: Mercado Pago API
- **APIs**: CEP (busca de endereço)
- **Acessibilidade**: VLibras

## 📦 Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [MongoDB](https://www.mongodb.com/) (local ou MongoDB Atlas)
- [Git](https://git-scm.com/)

## 🚀 Como Rodar o Projeto

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/casa-sabor.git
cd casa-sabor
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
- Certifique-se de que o MongoDB esteja rodando
- Configure a string de conexão no arquivo de configuração (se necessário)

### 4. Libere a execução de scripts no PowerShell (Windows)
Abra o PowerShell como Administrador e execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 5. Inicie o servidor backend
Em um terminal, execute:
```bash
node server.js
```
O servidor estará disponível em: `http://localhost:3000` (ou porta configurada)

### 6. Inicie o servidor frontend
Em outro terminal (mantenha o primeiro aberto), execute:
```bash
npx serve .
```
O frontend estará disponível em: `http://localhost:3001` (ou porta indicada pelo serve)

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
MONGODB_URI=mongodb://localhost:27017/casa-sabor
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
PORT=3000
```

### Mercado Pago
1. Crie uma conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Gere suas credenciais de teste/produção
3. Configure o access token no arquivo `.env`

## 📱 Como Usar

### Acesso Cliente
- Acesse `http://localhost:3001` (ou porta do serve)
- Navegue pelos produtos
- Adicione produtos ao carrinho
- Finalize a compra com Mercado Pago

### Acesso Administrativo
- Acesse `http://localhost:3001/admin` (ou rota configurada)
- Faça login com suas credenciais
- Gerencie produtos e visualize pedidos

## 🔍 Estrutura do Projeto

```
casa-sabor/
├── server.js              # Servidor principal
├── package.json           # Dependências do projeto
├── public/               # Arquivos estáticos (frontend)
│   ├── index.html        # Página principal
│   ├── admin.html        # Painel administrativo
│   ├── css/              # Estilos
│   └── js/               # Scripts frontend
├── routes/               # Rotas da API
├── models/               # Modelos do banco de dados
└── config/               # Configurações
```

## 🐛 Troubleshooting

### Problemas Comuns:

**Erro no PowerShell:**
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**MongoDB não conecta:**
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env`

**Porta em uso:**
- Termine processos na porta ou altere a porta no código

**Mercado Pago não funciona:**
- Verifique suas credenciais
- Confirme se está usando o ambiente correto (sandbox/produção)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

Seu Nome - [@seu_twitter](https://twitter.com/seu_twitter) - seu.email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/casa-sabor](https://github.com/seu-usuario/casa-sabor)

---

⭐ Se este projeto te ajudou, deixe uma estrela no repositório!
