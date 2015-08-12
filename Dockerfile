FROM grieve/go-static

RUN apt-get update
RUN apt-get install -y curl python python-dev
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get install -y nodejs

RUN npm install -g webpack

ADD . /static
RUN cd /static; npm install
RUN cd /static; webpack
