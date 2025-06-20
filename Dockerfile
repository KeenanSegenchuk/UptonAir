FROM python:3.9-slim AS flask-server

# Set the working directory for the Flask app
WORKDIR /app/flask-server

# Install Flask and other Python dependencies
COPY flask-server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask app files
COPY flask-server ./

# Expose the Flask app port
EXPOSE 5000

# Run the Flask app with Gunicorn and updater task in default python
CMD ["sh", "-c", "python updateTask.py & exec gunicorn -w 4 -b 0.0.0.0:5000 server:app"]
