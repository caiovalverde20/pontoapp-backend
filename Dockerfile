# Use uma imagem base do Node.js
FROM node:18

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./

# Instale as dependências
RUN npm install

# Copie os arquivos da aplicação
COPY . .

# Compile o TypeScript
RUN npm run build

# Exponha a porta do backend
EXPOSE 3000

# Inicie o servidor
CMD ["node", "dist/app.js"]
