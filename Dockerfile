FROM node:18 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/Modernize/browser /usr/share/nginx/html
COPY containers/angular/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
