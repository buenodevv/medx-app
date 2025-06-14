# Use Node.js 18 Alpine para menor tamanho
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Instalar dependências usando pnpm (já que existe pnpm-lock.yaml)
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN pnpm prisma generate

# Build da aplicação Next.js
RUN pnpm build

# Expor porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicialização
CMD ["pnpm", "start"]