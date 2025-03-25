import smtplib, ssl

def send_email(): 
	#open SSL port for sending emails
	port = 465
	context = ssl.create_default_context()
	sender_email = "uptonAQalerts@gmail.com"
	password = input("Enter email password for uptonAQalerts@gmail.com: ")
	ssl_smtp_server = smtplib.SMTP_SSL("smtp.gmail.com", port, context=context)
	ssl_smtp_server.login(sender_email, password)
	
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
		ssl_smtp_server.sendmail(sender_email, email_address, email_message)

send_email()