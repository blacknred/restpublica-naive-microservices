FROM node:latest

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src

# add `/usr/src/node_modules/.bin` to $PATH
ENV PATH /usr/src/node_modules/.bin:$PATH

# install and cache app dependencies
ADD package.json /usr/src/package.json
#ADD package-lock.json /usr/src/app/package-lock.json
#RUN cd /usr/src && npm install

COPY . /usr/src/app

# start app
CMD ["npm", "start"]