FROM node:16

RUN apt-get update 

# Create app directory
WORKDIR /usr/src/app
COPY . .

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available ([email protected]+)
WORKDIR /usr/src/app/client/
RUN npm i

WORKDIR /usr/src/app/server/
RUN npm i 

WORKDIR /usr/src/app/client/
RUN npm run build

WORKDIR /usr/src/app/cert/
RUN apt-get install -y openssl && \
    openssl req -x509 -nodes -days 365 \
    -subj  "/C=CA/ST=QC/O=Company Inc/CN=example.com" \
    -newkey rsa:2048 -keyout ./server-selfsigned.key \
    -out ./server-selfsigned.crt;

EXPOSE 443
WORKDIR /usr/src/app/server

# Using local tsc fails on balena ??
RUN npm i -g typescript
RUN tsc
CMD [ "node", "app.js" ]
