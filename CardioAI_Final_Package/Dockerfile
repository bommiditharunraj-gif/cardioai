# Build stage for ML model
FROM python:3.9-slim as builder

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
RUN python train_model.py

# Final stage
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies if any (none needed for now)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files (including the trained model from builder)
COPY --from=builder /app /app/backend
COPY --from=builder /app/models /app/backend/models

# Copy frontend files
COPY frontend /app/frontend

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PROJECT_ROOT=/app

# Expose port (Hugging Face Spaces uses 7860 by default)
EXPOSE 7860

# Command to run the application
# We use uvicorn to serve the FastAPI app which also serves static frontend files
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
