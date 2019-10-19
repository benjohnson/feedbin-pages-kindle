FROM node:12-alpine

RUN apk update && apk add curl

# Install kindlegen
RUN curl http://kindlegen.s3.amazonaws.com/kindlegen_linux_2.6_i386_v2_9.tar.gz > /tmp/kindlegen.tar.gz
RUN tar -xzf /tmp/kindlegen.tar.gz -C /tmp
RUN mv /tmp/kindlegen /usr/bin && rm -r /tmp/*

RUN mkdir -p /run
WORKDIR /run

ADD package.json .
ADD yarn.lock .
RUN yarn install

ADD . .

RUN ./bin/build.sh

CMD yarn start
