FROM influxdb:2.1

RUN apt-get update && \
    apt-get install -y openssl && \
    openssl req -x509 -nodes -days 365 \
    -subj  "/C=CA/ST=QC/O=Company Inc/CN=example.com" \
     -newkey rsa:2048 -keyout /etc/ssl/influxdb-selfsigned.key \
     -out /etc/ssl/influxdb-selfsigned.crt;
