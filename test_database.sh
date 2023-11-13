#!/bin/bash

# Define the name or ID of the Telegraf container
TELEGRAF_CONTAINER_NAME=$(docker ps --filter "status=running" --format "{{.Names}}" | grep -- "-telegraf" | head -n 1)

# Define the name or ID of the InfluxDB container
INFLUXDB_CONTAINER_NAME=$(docker ps --filter "status=running" --format "{{.Names}}" | grep -- "-influxdb" | head -n 1)

# Check if the Telegraf container is running
if ! docker ps | grep -q $TELEGRAF_CONTAINER_NAME; then
    echo "Telegraf container is not running."
    exit 1
fi

echo "Telegraf container is running."

# Check if the InfluxDB container is running
if ! docker ps | grep -q $INFLUXDB_CONTAINER_NAME; then
    echo "InfluxDB container is not running."
    exit 1
fi

echo "InfluxDB container is running. Checking for readiness..."

# Function to check if InfluxDB is ready
check_influxdb_ready() {
    # Replace with the command or API call to check InfluxDB readiness
    # For example, a simple health check query
    docker exec $INFLUXDB_CONTAINER_NAME /usr/local/bin/influx version
}

# Try to check readiness multiple times with a delay
MAX_ATTEMPTS=5
DELAY=10
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if check_influxdb_ready; then
        echo "InfluxDB is ready."
        exit 0
    fi
    echo "Waiting for InfluxDB to be ready (attempt $ATTEMPT of $MAX_ATTEMPTS)..."
    sleep $DELAY
    ((ATTEMPT++))
done

echo "InfluxDB did not become ready in time."
exit 2