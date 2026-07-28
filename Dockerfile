# Stage 1: Build the Vite React application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package configuration and install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx optimized for Cloud Run
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy production React build from builder stage
COPY --from=builder /app/dist ./

# Copy Cloud Run optimized Nginx config (listening on port 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects the container to listen on port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
