FROM mik9/telegraf:armv6

WORKDIR /etc/telegraf/
COPY ./etc .

RUN wget --no-verbose https://dl.influxdata.com/telegraf/releases/telegraf_1.18.0-1_armel.deb.asc && \
    wget --no-verbose https://dl.influxdata.com/telegraf/releases/telegraf_1.18.0-1_armel.deb && \
    gpg --batch --verify telegraf_1.18.0-1_armel.deb.asc telegraf_1.18.0-1_armel.deb && \
    dpkg -i telegraf_1.18.0-1_armel.deb && \
    rm -f telegraf_1.18.0-1_armel.deb*