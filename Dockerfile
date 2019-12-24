FROM node:12-alpine

LABEL "com.github.actions.name"="20Scoops-CNX-Localizer"
LABEL "com.github.actions.description"="Export google sheet with localizer."
LABEL "com.github.actions.icon"="toggle-right"
LABEL "com.github.actions.color"="red"
LABEL "repository"="https://github.com/20Scoops-CNX/action-localizer/"
LABEL "maintainer"="Elecweb<napat.m@20scoops.net>"

# Copy package.json and install
COPY package.json ./
RUN yarn

COPY src/index.js index.js

ENTRYPOINT [ "node","/index.js" ]