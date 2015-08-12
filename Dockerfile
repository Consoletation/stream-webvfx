FROM debian

RUN apt-get update && \
    apt-get install -y \
        curl \
        python \
        python-dev \
        python-pip \
        python-virtualenv
RUN curl -sL https://deb.nodesource.com/setup | bash -
RUN apt-get install -y nodejs

ADD requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN npm install -g webpack

COPY . /app
WORKDIR /app
RUN cp -a /tmp/node_modules /app/
RUN webpack

EXPOSE 8080
CMD ["supervisord", "-c", "supervisord-docker.conf", "-n"]
