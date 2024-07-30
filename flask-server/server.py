# This is our backend file
from flask import Flask

app = Flask(__name__)

# Members API Route
@app.route("/members")
def members():
    return {"members":["Syed", "Keenan", "Peter", "Laurie"]}

@app.route("/quality")
def quality():
    return{"7/30/2024":["Bad until 7:30 PM", "Good after 7:30 PM"], "7/31/2024":["Ok until 5:30 PM", "Poor after 5:30 PM"]}

if __name__ == "__main__":
    app.run(debug=True)