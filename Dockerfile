FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./
COPY package-lock.json ./

# Limpar cache do npm
RUN npm cache clean --force

# Instalar dependências
RUN npm install --production=false

# Copiar código fonte
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build da aplicação Next.js
RUN npm run build

# Expor porta
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicialização
CMD ["npm", "start"]