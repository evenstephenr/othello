FROM node:12-alpine
WORKDIR /.development/express-othello
COPY . .

RUN npm install
CMD ["node", "index.js"]
