# Upton Air Quality Management
## Overview
This repository contains data from Air Quality sensors in Upton, Massachusetts. Quite a lot of data comes off these monitors, ranging from current to hourly, daily, weekly monthly and yearly. 
<br>
However either or both are also at times out of order, as shown below:
![image](https://github.com/syedshazli/UptonAir/assets/146783525/b0baceea-dfbe-481c-a1c3-d5cbefc946e0)
<br>
in which case the Upton Board Of Health needs to be notified so they can figure out why they're off and what to do to get either or both restored. 
<br> You can view the Purple Air sensors here: https://map.purpleair.com/1/mAQI/a10/p604800/cC0#10.23/42.1606/-71.7123

# TODO:
Once restored, this is Square One for Understanding and using this wealth of data for health and safety considerations in general,  and all the more now that the wildfire smoke appears to be returning. 

This needs to be downloaded, organized,  recorded, "visualized" (on maps or charts) analyzed, and possibly shared with regional partner localities in Uxbridge and Northbridge. 

Related, the Mass State DEP has announced a grant program and Sustainable Upton's newly formed Air Quality Monitoring Project is exploring applying for grants for a 'network' of up to 10 more sensors, so there will be more data to be managed.

We hope to create a User-Interface that can send alerts or showthe status of the air quality sensors.

# How to Use
1. Run main to pull the last 2 weeks of data from purpleair's API.
2. Run data cleaner to order data by timestamp and remove duplicates.
(Sensors.txt specifies which sensors to pull from and data.txt is where the sensor data will be written to.)
