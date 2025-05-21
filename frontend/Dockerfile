# Stage 1: Build the React app
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the built app with NGINX
FROM nginx:1.23 AS production

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

# Copy the build output folder
COPY --from=build /app/build .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
