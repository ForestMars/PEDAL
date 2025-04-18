# utils.py - Mostly preloading functions needed to clean up Airflow model. 
__author__ = 'Forest Mars'
__version__ = '0.0.1' 
__all__ = ['load_app_env']

# import logger 
import os
from dotenv import load_dotenv

def load_app_env():
    """Loads the .env file and expands paths like '~' (for home directory)"""
    load_dotenv(dotenv_path=os.path.expanduser("~/myapp/.env"))

    # Expand the base path and any other paths with '~'
    base_path = os.path.expanduser(os.environ.get("MYAPP_BASE_PATH", "~/PEDAL"))
    os.environ["MYAPP_BASE_PATH"] = base_path  # Optional: Update the env with expanded path

    return base_path
