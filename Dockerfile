# -------------------------------
# Stage 1: Build React client
# -------------------------------
FROM node:16 AS build-client

# Set the working directory for the npm install
WORKDIR /app/client

# Copy over client code for building
COPY client ./

# Install dependencies
RUN npm install

# Build the React app
RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build

# -------------------------------
# Stage 3: Launch Flask server (with built client)
# -------------------------------
FROM python:3.9-slim AS flask-server

# Set the working directory for the Flask app
WORKDIR /app/flask-server

# Install Flask and other Python dependencies
COPY flask-server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask app files
COPY flask-server ./

# Copy the React app build into the Flask app directory
COPY --from=build-client /app/client/build /app/flask-server/static
# Copy the figs and infodocs folders manually from public/
COPY --from=build-client /app/client/public/figs /app/flask-server/static/figs
COPY --from=build-client /app/client/public/infodocs /app/flask-server/static/infodocs

# Expose the Flask app port
EXPOSE 5000

# Run the Flask app with Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "server:app"]
