import smtplib, ssl, os, time
from email.mime.text import MIMEText
from pgUtil import maxTimestamp

# Config
CHECK_INTERVAL = 20 * 60  # 20 minutes in seconds
STALE_THRESHOLD = 30 * 60  # 30 minutes in seconds

# Email setup
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465

SENDER_EMAIL = "uptonAQalerts@gmail.com"
SENDER_PASS = os.getenv("EMAIL_PASSWORD")
RECIPIENT_EMAIL = "5082774845@msg.fi.google.com"

def send_alert(latest_ts):
    """Send an SMS alert if DB data is stale."""
    msg = MIMEText(f"Database not updated in over 30 minutes.\nLast timestamp: {latest_ts}")
    msg["Subject"] = "DB Update Alert"
    msg["From"] = SENDER_EMAIL
    msg["To"] = RECIPIENT_EMAIL

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
        server.login(SENDER_EMAIL, SENDER_PASS)
        server.sendmail(SENDER_EMAIL, RECIPIENT_EMAIL, msg.as_string())

def main():
    while True:
        checkStatus()

def checkStatus():
    if True:
        now = int(time.time())
        latest_ts = maxTimestamp()  # must return unix time in seconds
        print(f"[INFO] Current time={now}, Latest DB ts={latest_ts}")

        if latest_ts < now - STALE_THRESHOLD:
            print("[WARN] Database is stale! Sending alert...")
            send_alert(latest_ts)
        else:
            print("[OK] Database updated recently.")

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
