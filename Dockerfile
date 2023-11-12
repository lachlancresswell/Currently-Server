FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install git
RUN addgroup --gid 20 macos
RUN adduser --uid 501 --gid 20 macos
