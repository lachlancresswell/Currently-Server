FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available ([email protected]+)
COPY . .

WORKDIR /usr/src/app/client
RUN npm install
CMD [ "npx", "webpack" ]

EXPOSE 8080
WORKDIR /usr/src/app/server
RUN npm install
CMD [ "node", "app.js" ]
