# FROM node:current-alpine

# ENV NODE_ENV=production

# RUN mkdir /app
# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN apt install python3
# RUN npm install -g node-gyp
# RUN npm install --production

# COPY . .

# CMD ["npm", "start"]

FROM node:current-alpine

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

COPY package.json .

RUN npm install --production

COPY . .

EXPOSE 4001

CMD ["npm", "start"]