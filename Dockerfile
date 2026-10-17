# syntax=docker/dockerfile:1

# ---- Stage 1: build the static site ----------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# The API URL is baked into the bundle at build time. This is the address the
# *browser* uses, so it must be reachable from the user's machine.
ARG VITE_API_BASE_URL=http://localhost:3333/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- Stage 2: serve with nginx ----------------------------------------------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
