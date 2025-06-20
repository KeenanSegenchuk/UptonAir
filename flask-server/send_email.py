import smtplib, ssl, os
from fileUtil import getSensorNames

port = 465
context = ssl.create_default_context()
sender_email = "uptonAQalerts@gmail.com"
password = os.getenv("EMAIL_PASSWORD")
ssl_smtp_server = smtplib.SMTP_SSL("smtp.gmail.com", port, context=context)
ssl_smtp_server.login(sender_email, password)

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

def send_email(alert):
    address, name, min_AQI, ids, cooldown, avg_window, last_alert, n_triggered, AQI = alert
    AQI = round(AQI, 2)
    email_address = address  # Mapping DB 'address' to actual email address

    # Convert ids to sensor names
    sensors = getSensorNames(ids)

    # Convert last_alert into time ago in days and hours
    last_alert_time = datetime.fromtimestamp(last_alert)
    time_since_last_alert = datetime.now() - last_alert_time
    days = time_since_last_alert.days
    hours = time_since_last_alert.seconds // 3600
    last_alert_str = f"{days} day(s) and {hours} hour(s)"

    if last_alert == 0:
        last_alert_str = "N/A"

    # Compose email
    subject = f"Air Quality Alert Triggered: {name}"
    sender_email = "uptonAQalerts@gmail.com"

    # HTML Message
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #d9534f;">Your Air Quality Alert <strong>{name}</strong> has been triggered</h2>
        <p>
          The selected sensors have averaged <strong>{AQI}</strong> over the past <strong>{avg_window}</strong> minutes.
          <br>
        </p>
        <p>
          This alert will not trigger again for <strong>{cooldown}</strong> hour(s).
        </p>
        <hr>
        <p><strong>More info:</strong></p>
        <ul>
          <li>Selected Sensors: <strong>{sensors}</strong></li>
          <li>Alert Threshold: <strong>{min_AQI} AQI</strong></li>
          <li>Last Triggered: <strong>{last_alert_str}</strong> ago</li>
          <li>Times Triggered: <strong>{n_triggered}</strong></li>
        </ul>
        <p style="font-size: 0.9em; color: #888;">You are receiving this email because you subscribed to air quality alerts from Upton-Air.com.</p>
      </body>
    </html>
    """

    # MIME setup
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = email_address
    msg.attach(MIMEText(html, "html"))

    # Send the email
    ssl_smtp_server.sendmail(sender_email, email_address, msg.as_string())