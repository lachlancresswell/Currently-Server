FROM node:16

RUN apt-get update 

# Create app directory
WORKDIR /usr/src/app

WORKDIR /usr/src/app/cert/
RUN apt-get install -y openssl && \
    openssl req -x509 -nodes -days 365 \
    -subj  "/C=CA/ST=QC/O=Company Inc/CN=example.com" \
    -newkey rsa:2048 -keyout ./server-selfsigned.key \
    -out ./server-selfsigned.crt;

WORKDIR /usr/src/app/server/
COPY ./server/package.json .
RUN npm i 

COPY ./server/ .
EXPOSE 443
EXPOSE 80
EXPOSE 9229

WORKDIR /usr/src/app/client/
COPY ./client/ .

WORKDIR /usr/src/app/server/
CMD [ "node", "--inspect=0.0.0.0:9229", "./src/app.js" ]
