# process_prd.py - Define
__author__ = 'Forest Mars'
__version__ = '0.0.1' 
__all__ = ["move_and_process_file"]

import os
import shutil
from datetime import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator

from config.utils import load_app_env


DAG_ID = "proces_prd"
DAG_DESC = "Processes new files in the PRDs directory"

# Load environment and get BASE_PATH
BASE_PATH = load_app_env()

# Define paths relative to BASE_PATH
WATCHED_DIR = os.path.join(BASE_PATH, "artifacts", "prds", "new")
DONE_DIR = os.path.join(BASE_PATH, "artifacts", "prds", "done")
PROCESSED_DIR = os.path.join(BASE_PATH, "artifacts", "models", "new")

# Ensure directories exist
for directory in [WATCHED_DIR, DONE_DIR, PROCESSED_DIR]:
    os.makedirs(directory, exist_ok=True)

def move_and_process_file():
    file_names = os.listdir(WATCHED_DIR)
    if not file_names:
        return

    for file_name in file_names:
        input_path = os.path.join(WATCHED_DIR, file_name)
        done_path = os.path.join(DONE_DIR, file_name)
        processed_path = os.path.join(PROCESSED_DIR, f"processed_{file_name}")
        
        # Move file to 'done'
        shutil.move(input_path, done_path)
        
        # Process the file by appending "~~FILE HAS BEEN PROCESSED~~"
        with open(done_path, 'r') as f:
            content = f.read()
        
        processed_content = content + "\n~~FILE HAS BEEN PROCESSED~~"
        
        # Write processed content to new location
        with open(processed_path, 'w') as f:
            f.write(processed_content)

with DAG(
    dag_id=DAG_ID,
    description=DAG_DESC,
    start_date=datetime(2025, 4, 15),
    schedule="@hourly",
    catchup=False,
    default_args={"owner": "admin", "retries": 0},
) as dag:
    move_and_process_task = PythonOperator(
        task_id="move_and_process_file",
        python_callable=move_and_process_file,
    )
