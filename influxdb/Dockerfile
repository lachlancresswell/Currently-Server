FROM influxdb:2.0.9

RUN apt-get update && \
    apt-get install -y openssl && \
    openssl req -x509 -nodes -days 365 \
    -subj  "/C=CA/ST=QC/O=Company Inc/CN=example.com" \
     -newkey rsa:2048 -keyout /etc/ssl/influxdb-selfsigned.key \
     -out /etc/ssl/influxdb-selfsigned.crt;

RUN chmod 644 /etc/ssl/influxdb-selfsigned.crt
# TODO chmod 600 cuasing permission issuebut recommended by influxdb docs
RUN chmod 644 /etc/ssl/influxdb-selfsigned.key