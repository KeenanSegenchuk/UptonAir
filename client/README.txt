Upton Air Client

Purpose: Display air quality data to inform the public.

File Structure:
  /src
    /components
	*Contains React elements
    /pages
	*Contains the webpages for the site
    /getObj.js
	*Contains static functions used to deliver constants such as sensor name to id mappings and the locations of the buttons on the map
    /graphUtil.js
	*Contains static graphing functions used to calculate averages for the bar graph and generate the background gradient
  /public
    /figs
	*Contains images used on the website
    /infodocs
	*Contains JSON files for storing static info

API Usage (/src):
  /pages
    /home
	*/api/aqi/avg/
  /components
    /Graph.js
	*/api/aqi/time/
    /SensorInfo.js
	*/api/aqi/sensorinfo/

