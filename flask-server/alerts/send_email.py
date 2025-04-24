import smtplib, ssl
import os

sender_email = "uptonAQalerts@gmail.com"
password = os.getenv("EMAIL_PASSWORD")
if not password:
	password = input(f"Enter email password for {sender_email}: ")

try:
	#open SSL port for sending emails
	port = 465
	context = ssl.create_default_context()
	ssl_smtp_server = smtplib.SMTP_SSL("smtp.gmail.com", port, context=context)
	ssl_smtp_server.login(sender_email, password)
except:
	print("Bad password, email alerts will not be sent from this instance.")


def static_send_email(): 
	#old function for testing functionality of sending emails
	
	#load mailing list and email templates
	maildir = "alerts/"
	with open(maildir + "mailing list.txt") as fmail:
		list_emails = fmail.read().splitlines()
	with open(maildir + "test.txt") as fmail:
		email_message = fmail.read()
	
	#send emails
	for email_address in list_emails:
		print(f"Sending email to {email_address}...")
		print(f"Message: {email_message}")
		try:
			ssl_smtp_server.sendmail(sender_email, email_address, email_message)
		except Error as e:
			print(f"Error sending mail: {e}")

def send_email(email_address, AQI_cutoff, current_avg):
	#send_email formats and sends emails to alerts subscribers
	
	with open("alerts/alert_layout.txt") as f:
		template = f.read()

	email_message = template.format(current_avg, AQI_cutoff)
	
	print(f"Sending email to {email_address}...")
	print(f"Message: {email_message}")
	try:
		ssl_smtp_server.sendmail(sender_email, email_address, email_message)
	except Error as e:
		print(f"Error sending mail: {e}")

if __name__ == "__main__":
	send_email(sender_email, -1, 0)