#!/bin/bash

# Install Python dependencies (including Airflow)
pip install -r requirements.txt --constraint "https://raw.githubusercontent.com/apache/airflow/constraints-2.10.5/constraints-3.8.txt"

# Install Node.js dependencies (this should use bun)
npm install

echo "Installation complete!"

