FROM debian:jessie

# Python and other dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        curl \
        python \
        python-dev \
        nginx \
        python-pip \
        python-virtualenv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Node stable
RUN curl -sL https://deb.nodesource.com/setup | bash - && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# nginx config
ADD ./nginx.conf /etc/nginx/nginx.conf
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx.key -out /etc/ssl/private/nginx.crt -subj req -new -passin pass:client11 -subj "/C=US/ST=New Sweden/L=Stockholm/O=.../OU=.../CN=.../emailAddress=..."

# restart nginx to load the config
RUN service nginx stop

COPY . /app
WORKDIR /app
RUN make clean && make build

EXPOSE 8080 8443
CMD ["venv/bin/supervisord", "-c", "supervisord-docker.conf", "-n"]
