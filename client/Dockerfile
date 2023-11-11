FROM node:lts-alpine

WORKDIR /usr/src/client
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install && mv node_modules ../
COPY . .
COPY ./Types.ts ../Types.ts
EXPOSE 3000
# RUN chown -R node /usr/src/client
# USER node
CMD ["npm", "start"]
# CMD ["tail", "-f", "/dev/null"] # Debug