# How to Run CardioAI on Windows

This project is a full-stack AI health platform. To run it on your Windows laptop, follow these simple steps:

## Step 1: Install Docker Desktop
If you don't have it already, download and install **Docker Desktop for Windows**:
[https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

> [!IMPORTANT]
> Make sure Docker Desktop is **running** before you proceed to the next steps.

## Step 2: Extract the Project
Extract the `Heart-disease.zip` file to a folder of your choice (e.g., your Desktop).

## Step 3: Run the Application
There are two ways to run the app:

### Option A: Using the Batch File (easiest)
1. Open the extracted `Heart-disease` folder.
2. Double-click on `RUN_FOR_WINDOWS.bat`.
3. This will automatically build and start both the backend and frontend.

### Option B: Using the Command Prompt
1. Open a terminal (Command Prompt or PowerShell) in the project folder.
2. Run the following command:
   ```bash
   docker-compose up --build
   ```

## Step 4: Access the App
Once the services are running, open your web browser and go to:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)

## Troubleshooting
- If you see a "Docker not found" error, ensure Docker Desktop is installed and running.
- If port 3000 or 8000 is already in use, you might need to close other applications or change the ports in `docker-compose.yml`.

Enjoy exploring the application!
