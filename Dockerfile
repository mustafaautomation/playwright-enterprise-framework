FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npx playwright install --with-deps

COPY . .

RUN chown -R pwuser:pwuser /app
USER pwuser

CMD ["npx", "playwright", "test", "--grep", "@regression"]
