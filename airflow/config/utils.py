# utils.py - Mostly preloading functions needed to clean up Airflow model. 
__author__ = 'Forest Mars'
__version__ = '0.0.1' 
__all__ = ['load_app_env', 'load_app_env_']

# import logger 
import os
from dotenv import load_dotenv

def load_app_env_():
    """Loads the .env file and expands paths like '~' (for home directory)"""
    load_dotenv(dotenv_path=os.path.expanduser("~/myapp/.env"))

    # Expand the base path and any other paths with '~'
    base_path = os.path.expanduser(os.environ.get("MYAPP_BASE_PATH", "~/PEDAL"))
    os.environ["MYAPP_BASE_PATH"] = base_path  # Optional: Update the env with expanded path

    return base_path

def load_app_env():
    """Loads the .env file and expands paths like '~' (for home directory)"""
    try:
        # Get the base path from env or default
        raw_base_path = os.environ.get("MYAPP_BASE_PATH", "~/sandbox/PEDAL/final_app")
        print(f"DEBUG: Raw base path: {raw_base_path}")

        # Expand the base path
        base_path = os.path.expanduser(raw_base_path)
        print(f"DEBUG: Expanded base path: {base_path}")

        # Construct and expand dotenv path
        dotenv_path = os.path.expanduser(os.path.join(base_path, ".env"))
        print(f"DEBUG: Dotenv path: {dotenv_path}")

        # Check if .env file exists
        if not os.path.exists(dotenv_path):
            print(f"WARNING: .env file not found at: {dotenv_path}")
        else:
            print(f"DEBUG: .env file found at: {dotenv_path}")

        # Load the .env file
        success = load_dotenv(dotenv_path=dotenv_path)
        if success:
            print(f"INFO: Successfully loaded .env file from: {dotenv_path}")
        else:
            print(f"ERROR: Failed to load .env file from: {dotenv_path}")

        # Update environment variable with expanded path
        os.environ["MYAPP_BASE_PATH"] = base_path
        print(f"DEBUG: Updated MYAPP_BASE_PATH env var to: {base_path}")

        return base_path

    except Exception as e:
        print(f"ERROR: Failed in load_app_env: {str(e)}")
        raise