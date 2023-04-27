#!/bin/bash

# Parse command line arguments
if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <server-ip> <server-port>"
    exit 1
fi

SERVER_IP=$1
SERVER_PORT=$2

# Test web server root
echo -n "Testing web server root... "
curl -s "http://$SERVER_IP:$SERVER_PORT/" > /dev/null
if [[ $? -eq 0 ]]; then
    echo "PASS"
else
    echo "FAIL"
fi

# Test /neighbours endpoint
echo -n "Testing /neighbours endpoint... "
curl -s "http://$SERVER_IP:$SERVER_PORT/neighbours" > /dev/null
if [[ $? -eq 0 ]]; then
    echo "PASS"
else
    echo "FAIL"
fi

# Test /config endpoint
echo -n "Testing /config endpoint... "
curl -s "http://$SERVER_IP:$SERVER_PORT/config" > /dev/null
if [[ $? -eq 0 ]]; then
    echo "PASS"
else
    echo "FAIL"
fi

# Test node debugging
echo -n "Testing node debugging... "
curl -s "http://$SERVER_IP:9229" > /dev/null
if [[ $? -eq 0 ]]; then
    echo "PASS"
else
    echo "FAIL"
fi

# Test InfluxDB instance
echo -n "Testing InfluxDB instance... "
curl -s "http://$SERVER_IP:8086/ping" > /dev/null
if [[ $? -eq 0 ]]; then
    echo "PASS"
else
    echo "FAIL"
fi

# Test /influx endpoint
echo -n "Testing /influx endpoint... "
curl -s "http://$SERVER_IP:$SERVER_PORT/influx/ping" > /dev/null
if [[ $? -eq 0 ]]; then
    echo "PASS"
else
    echo "FAIL"
fi
