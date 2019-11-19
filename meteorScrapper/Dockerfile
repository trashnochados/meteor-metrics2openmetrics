FROM node:10.17.0-stretch

RUN apt-get update && apt-get install -y curl
WORKDIR /server
COPY ./ /server
RUN npm install

CMD ["npm", "start"]
