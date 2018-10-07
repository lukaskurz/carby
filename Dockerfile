FROM node:carbon

WORKDIR /opt/carby

COPY ./ ./

RUN npm install &&\
    npm run build

CMD npm start