# Build stage
FROM node:20-alpine as build-stage
ARG REACT_APP_GRAFANA_BROWSER_URL
ENV REACT_APP_GRAFANA_BROWSER_URL=$REACT_APP_GRAFANA_BROWSER_URL
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
