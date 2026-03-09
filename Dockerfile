FROM mcr.microsoft.com/playwright:v1.58.0-noble

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

USER pwuser

CMD ["npx", "playwright", "test", "--grep", "@regression"]
