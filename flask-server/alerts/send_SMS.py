from twilio.rest import Client
import os

def send_SMS(number):
	# Find your Account SID and Auth Token at twilio.com/console
	# and set the environment variables. See http://twil.io/secure
	account_sid = os.environ["TWILIO_ACCOUNT_SID"]
	auth_token = os.environ["TWILIO_AUTH_TOKEN"]
	client = Client(account_sid, auth_token)
	
	message = client.messages.create(
	    body="Test Air Quality Alert",
	    from_="+15017122661",
	    to=number,
	)