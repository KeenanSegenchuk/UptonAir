Workflows:
	Development:
		open 2 command line windows
		navigate to uptonair/flask-server and uptonair/client respectively using the cd command
		in flask-server:
			to install dependencies, run the command "pip install -r requirements.txt"
			you will need to install pgAdmin to use the dev postgre database
				to run the server with pg database, run "python -m flask --app server run"
				to run the the server without pg databse, run "python -m flask --app server_nopg run"
			once the client is launched you can update the data by visiting localhost:3000/update
		in client:
			to install dependencies, run the command "npm install"
			to run launch the client, run "npm start"
		type the url http//localhost:3000 in your browser to view the page
	Production:
		When installing:
			install docker
			run docker image on server by using command "docker-compose build"
		When launching:
			Run "docker-compose up",
			or "docker-compose up --build" to build and launch.
		When updating:
			Docker tries not to rebuild files that haven't changed, but sometimes it fails to detect minor changes.
			You may need to run "docker-compose up -no-cache", but make sure to have a database backup just in case.
		TODO: 
			Setup website urls & http/https if I can get a certificate
			Probably will have to port forward the server's port 80 to the docker image's port 80

TODO:
	Front End:
		-Update aesthetic to be more modern
		Done!-Check map buttons and make sure the borders update properly when lines are added and removed
		Done!-Add field in alerts form that sets min_AQI value to trigger an alert notification
		Done!-Interface alerts form with new API for postgreSQL database
		-Clean up react warnings
	Back End:
		Done!-Add functionality to detect if any specific sensor goes above min_AQI
		-Setup automated text alerts
		-Make tests
