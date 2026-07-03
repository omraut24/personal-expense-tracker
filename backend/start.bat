@echo off
echo Starting backend...

:: Check if venv exists, create it if not
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    echo Installing dependencies...
    venv\Scripts\pip install -r requirements.txt
)

:: Activate venv and run uvicorn from inside it
echo Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Backend running at http://localhost:8000
echo API docs at      http://localhost:8000/docs
echo Press CTRL+C to stop.
echo.

venv\Scripts\uvicorn app.main:app --reload --port 8000
