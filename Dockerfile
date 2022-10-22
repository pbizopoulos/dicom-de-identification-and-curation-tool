FROM ghcr.io/puppeteer/puppeteer:19.1.0
COPY package.json .
RUN npm install
