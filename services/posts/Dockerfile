FROM node:latest
#docker pull hiromis/ubuntu1604-node8-ffmpeg-im

# set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src

# add `/usr/src/node_modules/.bin` to $PATH
ENV PATH /usr/src/node_modules/.bin:$PATH

# install and cache app dependencies
ADD package.json /usr/src/package.json
ADD package-lock.json /usr/src/app/package-lock.json
#RUN npm install

# install ffmpeg
RUN apt-get update && apt-get -y install software-properties-common python-software-properties
RUN add-apt-repository -y ppa:mc3man/trusty-media 
RUN apt-get update && apt-get -y install ffmpeg libav-tools x264 x265
# RUN apt-get update && \
# apt-get install -y software-properties-common && \
# apt-add-repository ppa:mc3man/trusty-media -y && \
# apt-get update && \
# apt-get install -y ffmpeg

# start app
CMD ["npm", "start"]
