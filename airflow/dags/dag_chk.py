# dag_chk.py - Defines a DAG to check sanity of Airflow setup
__author__ = 'Forest Mars'
__version__ = '0.0.1' 
__all__ = ['print_sanity_check']

import os # this is used for debugging (only)
import sys # this is used for debugging (only)
from datetime import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator

# Print out Python's search paths to debug where it's looking for modules
print("Python Path at runtime:")
for path in sys.path:
    print(path)

# Check the AIRFLOW_HOME path
print("\nAIRFLOW_HOME:", os.getenv('AIRFLOW_HOME'))

# Check the current working directory
print("\nCurrent working directory:", os.getcwd())

# If you're trying to import airflow_config, make sure it's in the path
try:
    import airflow_config
    print("\nSuccessfully imported airflow_config!")
except ModuleNotFoundError as e:
    print("\nFailed to import airflow_config:", e)

from config.utils import load_app_env


DAG_ID = "dag_chk"
DAG_DESC = "Sanity check DAG to confirm Airflow setup."

# Load environment (not used)
# BASE_PATH = load_app_env()

def print_sanity_check():
    print("✅ This is an example DAG.")

with DAG(
    dag_id=DAG_ID,
    description=DAG_DESC,
    start_date=datetime(2025, 4, 15),
    schedule=None,  # manual trigger only
    catchup=False,
    default_args={"owner": "admin", "retries": 0},
) as dag:
    sanity_task = PythonOperator(
        task_id="print_sanity_check",
        python_callable=print_sanity_check,
    )
