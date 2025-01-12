# PontoApp Backend

Este repositório contém o backend da aplicação **PontoApp**, desenvolvida como parte de um desafio técnico. Ele fornece uma API para controle de ponto dos colaboradores, permitindo iniciar e finalizar turnos, além de acompanhar as horas trabalhadas.

O frontend associado ao projeto pode ser encontrado [aqui](https://github.com/caiovalverde20/pontoapp-frontend).

## **Como executar**

1. Clone este repositório:
   ```bash
   git clone https://github.com/caiovalverde20/pontoapp-backend.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd pontoapp-backend
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Execute o backend e o banco de dados com Docker:
   ```bash
   docker-compose up --build
   ```

5. Para rodar os testes:
   ```bash
   npm test
   ```

## **Deploy e documentação**

O backend está disponível no seguinte link:
[https://pontoapp-backend.onrender.com](https://pontoapp-backend.onrender.com)

A documentação completa de todas as rotas da API pode ser acessada no Postman:
[Documentação no Postman](https://documenter.getpostman.com/view/18629221/2sAYQWKDnG)

## **Codigo de usuario** 

invés do codigo de usuario agora é um username gerado automaticamente baseado no nome do usuario, sendo muito mais pratico de lembrar.

## **Branches**

Como é um pequeno projeto de uma pessoa só fiz todos os commits em 1 branch apenas, o que normalmente não é uma boa prática

## **Tecnologias utilizadas**
- **Node.js**
- **TypeScript**
- **TypeORM**
- **PostgreSQL**
- **Docker**
- **Jest**
