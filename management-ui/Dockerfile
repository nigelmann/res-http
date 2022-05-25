FROM node:lts-stretch

COPY . /app/

# Building VueJS app
WORKDIR /app/res-http-management-ui
RUN npm install
RUN npm run build

## Installing express 
WORKDIR /app/
RUN npm install


#EXPOSE 3000
ENTRYPOINT [ "node", "./index.js" ]
