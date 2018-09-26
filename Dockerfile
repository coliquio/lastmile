FROM node:10-alpine

ENV PORT=8000

EXPOSE $PORT

ADD . /app

WORKDIR /app

RUN npm install --production

CMD ["node", "index.js"]
