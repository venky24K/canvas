# Google Cloud Run Multi-Stage Docker Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY . .

# Google Cloud Run forwards port 8080 by default
ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]
