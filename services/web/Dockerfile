FROM node:alpine

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache app dependencies
ADD package.json /usr/src/app/package.json
ADD package-lock.json /usr/src/app/package-lock.json
#RUN cd /usr/src/app && npm install
RUN npm install react-scripts@0.9.5 -g
RUN npm install serve -g

COPY . /usr/src/app

# start app
CMD ["npm", "start"]
