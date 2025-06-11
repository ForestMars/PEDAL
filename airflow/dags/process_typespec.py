# process_typespec.py - Defines a DAG to process TypeSpec files
__author__ = 'Forest Mars'
__version__ = '0.0.1' 
__all__ = ["move_and_process_typespec"]

import os
import shutil
from datetime import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator

import airflow_config
from config.utils import load_app_env

DAG_ID = "process_typespec"
DAG_DESC = "Processes TypeSpec files and moves them to the next stage"

# Load environment and get BASE_PATH
BASE_PATH = load_app_env()

# Define paths relative to BASE_PATH
WATCHED_DIR = os.path.join(BASE_PATH, "artifacts", "typespec", "new")
DONE_DIR = os.path.join(BASE_PATH, "artifacts", "typespec", "done")
PROCESSED_DIR = os.path.join(BASE_PATH, "artifacts", "schema", "new")

# Ensure directories exist
for directory in [WATCHED_DIR, DONE_DIR, PROCESSED_DIR]:
    os.makedirs(directory, exist_ok=True)

def move_and_process_typespec():
    print(f"Checking for files in: {WATCHED_DIR}")
    file_names = os.listdir(WATCHED_DIR)
    
    if not file_names:
        print("No new files found.")
        return

    print(f"Found files: {file_names}")

    for file_name in file_names:
        input_path = os.path.join(WATCHED_DIR, file_name)
        done_path = os.path.join(DONE_DIR, file_name)
        processed_path = os.path.join(PROCESSED_DIR, f"processed_{file_name}")

        print(f"Processing file: {input_path}")
        
        # Move file to 'done'
        try:
            shutil.move(input_path, done_path)
            print(f"Moved {input_path} to {done_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to move {input_path} to {done_path}: {e}")

        # Read the moved file
        try:
            with open(done_path, 'r') as f:
                content = f.read()
        except Exception as e:
            raise RuntimeError(f"Failed to read {done_path}: {e}")

        # Process content (placeholder for actual TypeSpec processing)
        # TODO: Implement actual TypeSpec processing
        processed_content = content + f"\n~~TYPESPEC PROCESSED AT {datetime.now().isoformat()}~~"

        # Write processed content to PROCESSED_DIR
        try:
            with open(processed_path, 'w') as f:
                f.write(processed_content)
            print(f"Wrote processed file to {processed_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to write {processed_path}: {e}")

with DAG(
    dag_id=DAG_ID,
    description=DAG_DESC,
    start_date=datetime(2025, 4, 15),
    schedule="*/5 * * * *",
    catchup=False,
    default_args={"owner": "admin", "retries": 0},
) as dag:
    move_and_process_task = PythonOperator(
        task_id="move_and_process_typespec",
        python_callable=move_and_process_typespec,
    ) 