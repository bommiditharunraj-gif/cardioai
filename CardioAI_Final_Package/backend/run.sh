#!/bin/bash
# Script to run the backend with the correct environment

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the backend directory
cd "$DIR"

# Unset PYTHONPATH to avoid conflicts with system packages
export PYTHONPATH=

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run the application
if [ "$1" == "train" ]; then
    python train_model.py
else
    python main.py
fi
