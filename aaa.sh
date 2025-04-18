#!/bin/bash

# Set Airflow home environment variable
export AIRFLOW_HOME=~/airflow  # or your custom AIRFLOW_HOME directory

# Initialize the database (if you haven't already)
airflow db migrate

# Create the admin user
airflow users create \
    --username admin \
    --firstname Admin \
    --lastname User \
    --email admin@example.com \
    --role Admin \
    --password admin

echo "Admin user created with username: admin and password: admin"

