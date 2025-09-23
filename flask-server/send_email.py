import smtplib, ssl, os
from fileUtil import getSensorNames

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

def send_email(alert):
    address, name, unit, min_AQI, ids, cooldown, avg_window, last_alert, n_triggered, AQI = alert
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

    #setup connection config
    port = 465
    context = ssl.create_default_context()
    sender_email = "uptonAQalerts@gmail.com"
    password = os.getenv("EMAIL_PASSWORD")

    with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
        # GMail Login
        server.login(sender_email, password)
        # Send the email
        server.sendmail(sender_email, email_address, msg.as_string())

def send_email2(alert_obj):
    alert_info = alert_obj["alert"]
    triggered_ids = alert_obj["triggered_ids"]  # List of [id, avg]
    other_ids = alert_obj["other_ids"] #same format as triggered_ids
    avg_aqi = alert_obj["avg_aqi"]

    # Unpack alert info
    address = alert_info["address"]
    name = alert_info["name"]
    unit = alert_info["unit"]
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
    other_sensor_data = [
        (getSensorNames([sensor_id]), round(sensor_avg, 2))
        for sensor_id, sensor_avg in other_ids
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
    other_sensors_html = "".join(
        f"<tr><td style='padding: 4px 12px;'>{sensor_name}</td><td style='padding: 4px 12px;'>{aqi}</td></tr>"
        for sensor_name, aqi in other_sensor_data
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
        
        <h3 style="margin-top: 24px;">🚨 Sensors That Triggered The Alert</h3>
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

        {(
            '<h3 style="margin-top: 24px;">🟢 Other Sensors Monitored By This Alert </h3>'
            '<table style="border-collapse: collapse; margin-top: 10px;">'
              '<thead>'
                '<tr style="background-color: #f2f2f2;">'
                  '<th style="text-align: left; padding: 6px 12px;">Sensor</th>'
                  '<th style="text-align: left; padding: 6px 12px;">Avg AQI</th>'
                '</tr>'
              '</thead>'
              '<tbody>'
                f'{other_sensors_html}'
              '</tbody>'
            '</table>'
        ) if other_sensors_html else ""}


        <p>
          <strong>Alert Threshold:</strong> {min_AQI} AQI<br>
          <strong>Cooldown Period:</strong> {cooldown} hour(s)<br>
          <strong>Last Triggered:</strong> {last_alert_str} ago<br>
          <!--<strong>Total Times Triggered:</strong> {n_triggered}-->
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

    #setup connection config
    port = 465
    context = ssl.create_default_context()
    sender_email = "uptonAQalerts@gmail.com"
    password = os.getenv("EMAIL_PASSWORD")

    with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
        # GMail Login
        server.login(sender_email, password)
        # Send the email
        server.sendmail(sender_email, email_address, msg.as_string())

def send_email3(alert_obj):
    alert_info = alert_obj["alert"]
    triggered_ids = alert_obj["triggered_ids"]  # List of [id, avg]
    other_ids = alert_obj["other_ids"] #same format as triggered_ids
    avg_aqi = alert_obj["avg_aqi"]

    # Unpack alert info
    address = alert_info["address"]
    name = alert_info["name"]
    unit = alert_info["unit"]
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
    other_sensor_data = [
        (getSensorNames([sensor_id]), round(sensor_avg, 2))
        for sensor_id, sensor_avg in other_ids
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
    other_sensors_html = "".join(
        f"<tr><td style='padding: 4px 12px;'>{sensor_name}</td><td style='padding: 4px 12px;'>{aqi}</td></tr>"
        for sensor_name, aqi in other_sensor_data
    )

    # HTML Message
    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #d9534f;">Your Air Quality Alert <strong>{name}</strong> Has Been Triggered</h2>
        
        <p>
          <strong>The sensors you selected for this alert averaged </strong>{AQI}<strong> over the last </strong>{avg_window}<strong> minutes.</strong>
        </p>
        
        <h3 style="margin-top: 24px;">🚨 Sensors That Exceeded Alert Threshold </h3>
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

        {(
            '<h3 style="margin-top: 24px;">🟢 Other Sensors Monitored By This Alert </h3>'
            '<table style="border-collapse: collapse; margin-top: 10px;">'
              '<thead>'
                '<tr style="background-color: #f2f2f2;">'
                  '<th style="text-align: left; padding: 6px 12px;">Sensor</th>'
                  '<th style="text-align: left; padding: 6px 12px;">Avg AQI</th>'
                '</tr>'
              '</thead>'
              '<tbody>'
                f'{other_sensors_html}'
              '</tbody>'
            '</table>'
        ) if other_sensors_html else ""}


        <p>
          <strong>Alert Threshold:</strong> {min_AQI} {unit}<br>
          <strong>Cooldown Period:</strong> {cooldown} hour(s)<br>
          <strong>Last Triggered:</strong> {last_alert_str} ago<br>
          <!--<strong>Total Times Triggered:</strong> {n_triggered}-->
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

    #setup connection config
    port = 465
    context = ssl.create_default_context()
    sender_email = "uptonAQalerts@gmail.com"
    password = os.getenv("EMAIL_PASSWORD")

    with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
        # GMail Login
        server.login(sender_email, password)
        # Send the email
        server.sendmail(sender_email, email_address, msg.as_string())


def send_summary_email(alerts, email_address):
	# alerts is expected to be a list of tuples from pgListAlerts
	# (address, name, unit, min_AQI, ids, cooldown, avg_window, last_alert, n_triggered)

	# Build HTML table rows
	rows_html = ""
	for alert in alerts:
		address, name, unit, min_AQI, ids, cooldown, avg_window, last_alert, n_triggered = alert
		rows_html += f"""
			<tr>
				<td style="padding: 6px 12px;">{address}</td>
				<td style="padding: 6px 12px;">{name}</td>
				<td style="padding: 6px 12px;">{unit}</td>
				<td style="padding: 6px 12px;">{min_AQI}</td>
				<td style="padding: 6px 12px;">{ids}</td>
				<td style="padding: 6px 12px;">{cooldown} hr</td>
				<td style="padding: 6px 12px;">{avg_window} min</td>
				<td style="padding: 6px 12px;">{last_alert}</td>
				<td style="padding: 6px 12px;">{n_triggered}</td>
			</tr>
		"""

	# HTML email content
	html = f"""
	<html>
		<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
			<h2 style="color: #5cb85c;">📊 Upton-Air Alert Summary</h2>
			<p>Here is a summary of your alerts:</p>
			<table style="border-collapse: collapse; margin-top: 10px; border: 1px solid #ccc;">
				<thead>
					<tr style="background-color: #f2f2f2;">
						<th style="text-align: left; padding: 6px 12px;">Address</th>
						<th style="text-align: left; padding: 6px 12px;">Name</th>
						<th style="text-align: left; padding: 6px 12px;">Unit</th>
						<th style="text-align: left; padding: 6px 12px;">Min AQI</th>
						<th style="text-align: left; padding: 6px 12px;">IDs</th>
						<th style="text-align: left; padding: 6px 12px;">Cooldown</th>
						<th style="text-align: left; padding: 6px 12px;">Avg Window</th>
						<th style="text-align: left; padding: 6px 12px;">Last Alert</th>
						<th style="text-align: left; padding: 6px 12px;">Times Triggered</th>
					</tr>
				</thead>
				<tbody>
					{rows_html}
				</tbody>
			</table>
			<hr style="margin-top: 30px; margin-bottom: 20px;">
			<p style="font-size: 0.9em; color: #888;">
				You are receiving this email because you subscribed to Upton-Air alerts.
			</p>
		</body>
	</html>
	"""

	# Email setup
	sender_email = "uptonAQalerts@gmail.com"
	password = os.getenv("EMAIL_PASSWORD")

	msg = MIMEMultipart("alternative")
	msg["Subject"] = "Upton-Air Alert Summary"
	msg["From"] = sender_email
	msg["To"] = email_address
	msg.attach(MIMEText(html, "html"))

	# Send email
	port = 465
	context = ssl.create_default_context()
	with smtplib.SMTP_SSL("smtp.gmail.com", port, context=context) as server:
		server.login(sender_email, password)
		server.sendmail(sender_email, email_address, msg.as_string())
