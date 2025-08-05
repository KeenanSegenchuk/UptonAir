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

def send_email2(alert_obj):
    alert_info = alert_obj["alert"]
    triggered_ids = alert_obj["triggered_ids"]  # List of [id, avg]
    avg_aqi = alert_obj["avg_aqi"]

    # Unpack alert info
    address = alert_info["address"]
    name = alert_info["name"]
    min_AQI = alert_info["min_AQI"]
    ids = alert_info["ids"]
    cooldown = alert_info["cooldown"]
    avg_window = alert_info["avg_window"]
    last_alert = alert_info["last_alert"]
    n_triggered = alert_info["n_triggered"]

    email_address = address
    AQI = round(avg_aqi, 2)
    sensors = getSensorNames(ids)  # Full sensor list, comma-separated or string
    triggered_sensor_data = [
        (getSensorNames([sensor_id]), round(sensor_avg, 2))
        for sensor_id, sensor_avg in triggered_ids
    ]

    # Time since last alert
    if last_alert == 0:
        last_alert_str = "N/A"
    else:
        last_alert_time = datetime.fromtimestamp(last_alert)
        time_since_last_alert = datetime.now() - last_alert_time
        days = time_since_last_alert.days
        hours = time_since_last_alert.seconds // 3600
        last_alert_str = f"{days} day(s) and {hours} hour(s)"

    # Compose email
    subject = f"Air Quality Alert Triggered: {name}"
    sender_email = "uptonAQalerts@gmail.com"

    # Format triggered sensors into HTML rows
    triggered_sensors_html = "".join(
        f"<tr><td style='padding: 4px 12px;'>{sensor_name}</td><td style='padding: 4px 12px;'>{aqi}</td></tr>"
        for sensor_name, aqi in triggered_sensor_data
    )

    # HTML Message
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d9534f;">Your Air Quality Alert <strong>{name}</strong> Has Been Triggered</h2>
        
        <p>
          One or more of your selected sensors reported high AQI levels.
        </p>
        
        <p>
          <strong>Overall Average AQI:</strong> {AQI} (over the last {avg_window} minutes)
        </p>

        <h3 style="margin-top: 24px;">🚨 Sensors That Triggered the Alert</h3>
        <table style="border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="text-align: left; padding: 6px 12px;">Sensor</th>
              <th style="text-align: left; padding: 6px 12px;">Avg AQI</th>
            </tr>
          </thead>
          <tbody>
            {triggered_sensors_html}
          </tbody>
        </table>

        <p>
          <strong>Alert Threshold:</strong> {min_AQI} AQI<br>
          <strong>Cooldown Period:</strong> {cooldown} hour(s)<br>
          <strong>Last Triggered:</strong> {last_alert_str} ago<br>
          <strong>Total Times Triggered:</strong> {n_triggered}
        </p>

        <hr style="margin-top: 30px; margin-bottom: 20px;">
        <p style="font-size: 0.9em; color: #888;">
          You are receiving this email because you subscribed to air quality alerts on <a href="https://upton-air.com">Upton-Air.com</a>.
        </p>
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