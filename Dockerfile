FROM debian:jessie

# Python and other dependencies
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        curl \
        python \
        python-dev \
        python-pip \
        python-virtualenv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Node stable
RUN curl -sL https://deb.nodesource.com/setup | bash - && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . /app
WORKDIR /app
RUN make clean && make build

EXPOSE 8080
CMD ["make", "run"]
