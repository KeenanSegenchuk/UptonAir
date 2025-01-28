import time
import datetime
import pytz

#thanks chatGPT
def get_monday_midnight(timestamp, previous_monday=False):
    # Eastern Timezone (US)
    eastern = pytz.timezone('US/Eastern')
    
    # Convert the timestamp to a datetime object
    dt = datetime.datetime.fromtimestamp(timestamp, eastern)
    
    # Find the weekday of the current date (0=Monday, 1=Tuesday, ..., 6=Sunday)
    current_weekday = dt.weekday()
    
    # Calculate the number of days to the next or previous Monday
    if previous_monday:
        days_to_monday = -current_weekday
    else:
        days_to_monday = 7 - current_weekday if current_weekday != 0 else 0
    
    # Calculate the date for the desired Monday
    monday = dt + datetime.timedelta(days=days_to_monday)
    
    # Set the time to midnight
    monday_midnight = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Convert back to seconds since epoch
    monday_midnight_timestamp = int(monday_midnight.astimezone(eastern).timestamp())
    
    return monday_midnight_timestamp

# Example usage:
timestamp = time.time()  # Current timestamp in seconds since epoch
next_monday = get_monday_midnight(timestamp, previous_monday=False)  # Next Monday midnight
prior_monday = get_monday_midnight(timestamp, previous_monday=True)  # Prior Monday midnight

print("Current Time:", timestamp)
print("Next Monday Midnight:", next_monday)
print("Prior Monday Midnight:", prior_monday)