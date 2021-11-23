FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available ([email protected]+)
COPY . .

WORKDIR /usr/src/app/cert/

RUN apt-get update && \
    apt-get install -y openssl && \
    openssl req -x509 -nodes -days 365 \
    -subj  "/C=CA/ST=QC/O=Company Inc/CN=example.com" \
    -newkey rsa:2048 -keyout ./server-selfsigned.key \
    -out ./server-selfsigned.crt;
RUN ls -la

WORKDIR /usr/src/app/client
RUN npm install && npx webpack

EXPOSE 8080
WORKDIR /usr/src/app/server
RUN npm i && npm run build
RUN ls -la ../cert/

CMD [ "node", "app.js" ]
