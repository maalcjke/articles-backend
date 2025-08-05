FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

COPY start.sh ./
RUN chmod +x ./start.sh

CMD ["./start.sh"]

EXPOSE 8080