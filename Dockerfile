FROM python:3.9-slim AS flask-server

# Set the working directory for the Flask app
WORKDIR /app/flask-server

# Install Flask and other Python dependencies
COPY flask-server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask app files
COPY flask-server ./

# Copy the React app build into the Flask app directory
COPY client/build ./static

# NOT NECESSARY SINCE BOTH FOLDERS ARE ALREADY IN BUILD
# Copy the figs and infodocs folders manually from public/
# COPY client/static/figs ./static/figs
# COPY client/static/infodocs ./static/infodocs

# Expose the Flask app port
EXPOSE 5000

# Run the Flask app with Gunicorn and updater task in default python
CMD ["sh", "-c", "python updateTask.py & exec gunicorn -w 4 -b 0.0.0.0:5000 server:app"]
