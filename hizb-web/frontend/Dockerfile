# ---- build stage ----
FROM node:22-alpine AS build
WORKDIR /app
# Install deps first so this layer is cached until package*.json changes.
COPY package*.json ./
# Use `npm ci` once a package-lock.json is committed (reproducible installs).
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# ---- runtime stage: static files served by nginx ----
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/hizb-quran-web/browser /usr/share/nginx/html
EXPOSE 80
