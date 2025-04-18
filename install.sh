#!/bin/bash
set -e  # Exit immediately on error

# Load environment variables from .env
# NOTE: We use `. ./.env` (dot-space-dot-slash-env) for POSIX compatibility.
# Do not use `source .env` — it is not guaranteed to work in all shells.
# Always assume this script runs from the app root directory.
. ./.env

# Install Python dependencies (including Airflow)
# Future version can ship environemnt 
pip install -r requirements.txt --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-2.10.5/constraints-3.8.txt"

# Install Node.js dependencies (this should use bun)
npm install

# Verify AIRFLOW_HOME exists
if [ -z "$AIRFLOW_HOME" ]; then
  echo "ERROR: AIRFLOW_HOME is not set. Please ensure .env is correctly configured."
  exit 1
elif [ ! -d "$AIRFLOW_HOME" ]; then
  echo "ERROR: AIRFLOW_HOME directory '$AIRFLOW_HOME' does not exist."
  exit 1
fi

# Continue with Airflow setup
echo "AIRFLOW_HOME is set to $AIRFLOW_HOME"
airflow db migrate

echo "Installation complete!"

