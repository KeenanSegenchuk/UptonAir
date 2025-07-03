import datetime

LOG_FILE = "important-logs.txt"

def log(message):
    timestamp = datetime.datetime.now().isoformat(sep=' ', timespec='seconds')
    log_entry = f"[{timestamp}] {message}\n"
    try:
        with open(LOG_FILE, "a") as f:
            f.write(log_entry)
    except Exception as e:
        print(f"Failed to write log: {e}")