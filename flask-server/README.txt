Upton Air server

Purpose: Archive Upton's air quality data from purpleair, sort and QC the data, and serve it in an efficient manner to the client. 

File Structure:
  /server.py
	*Contains the flask server and it's various API definitions
  /cleanfn.py + /pullfn.py
	*Contains the code to pull and preprocess data going into the archive
  /PMtoAQI
	*Function to calculate AQI and EPA adjusted PM2.5/AQI values from sample: (humidity, PM2.5 channel A, PM2.5 channel B)
  /fileUtil
	*Contains functions to easier interface with data files
  /getByDate
	*Function to extract specific data from the archive
  /sensor-pos.json
	*Used to be used for button locations, but now is used to access a list of sensor ids
  /run.txt
	*Contains command used to run server
  /pyvenv.cfg
	*Contains the server's virtual environment config
  /data analysis
	*Contains extra and backup data, analysis functions, and deprecated functions

