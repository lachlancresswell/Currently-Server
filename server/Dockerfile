FROM node:lts-bookworm

WORKDIR /usr/src/server
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
COPY ./Types.ts ../Types.ts
RUN npm install && mv node_modules ../
COPY . .
RUN npx tsc
RUN ls -la
EXPOSE 8001
RUN chown -R node /usr/src/server
USER node
CMD ["npm", "run", "watch"]