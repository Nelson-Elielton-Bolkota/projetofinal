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
git clone https://github.com/Nelson-Elielton-Bolkota/projetofinal.git
cd projetofinal/casa%26sabor
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
O servidor estará disponível em: `http://localhost:3000`
A API de produtos estará em: `http://localhost:5000/api/products`

### 6. Inicie o servidor frontend
Em outro terminal (mantenha o primeiro aberto), execute:
```bash
npx serve .
```
O frontend estará disponível em: `http://localhost:3000` 

## 🔧 Configuração

### Mercado Pago
1. Crie uma conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Gere suas credenciais de teste/produção
3. Configure o access token no código

Testando Pagamentos
Para testar o checkout em ambiente de desenvolvimento, use os seguintes cartões de teste do Mercado Pago:
💳 Cartões para Aprovação (APRO)

Visa: 4013 5406 8274 6260
Mastercard: 5416 7526 0258 2580
American Express: 3711 8030 3257 522

❌ Cartões para Rejeição

Fundos insuficientes: 4013 5406 8274 6269
Recusado: 4168 8188 4444 7115

📋 Dados para Teste

CVV: Qualquer código de 3 ou 4 dígitos
Data de vencimento: Qualquer data futura
Nome do portador: Qualquer nome
CPF: 12345678909

⚠️ Importante: Estes cartões funcionam apenas no ambiente de teste (sandbox) do Mercado Pago.
https://www.mercadopago.com.br/developers/pt/docs/checkout-api/additional-content/your-integrations/test/cards

## 📱 Como Usar

### Acesso Cliente
- Acesse `http://localhost:3000` 
- Navegue pelos produtos
- Adicione produtos ao carrinho
- Finalize a compra com Mercado Pago

### Acesso Administrativo
- Acesse `http://localhost:3000/admin`
- Faça login com suas credenciais
- Gerencie produtos e visualize pedidos


### Problemas Comuns:

**Erro no PowerShell:**
- Execute: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**MongoDB não conecta:**
- Verifique se o MongoDB está rodando
- Confirme se a API de produtos está acessível em `localhost:5000/api/products`

**Porta em uso:**
- Termine processos na porta ou altere a porta no código

**Mercado Pago não funciona:**
- Verifique suas credenciais no código
- Confirme se está usando o ambiente correto (sandbox/produção)
