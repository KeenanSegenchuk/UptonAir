# Upton Air Quality Management
## Overview
This repository contains data from Air Quality sensors in Upton, Massachusetts. Quite a lot of data comes off these monitors, ranging from current to hourly, daily, weekly monthly and yearly. 
<br>
However either or both are also at times out of order, as shown below:
![image](https://github.com/syedshazli/UptonAir/assets/146783525/b0baceea-dfbe-481c-a1c3-d5cbefc946e0)
<br>
in which case the Upton Board Of Health needs to be notified so they can figure out why they're off and what to do to get either or both restored.



# How to Use
1. Run main to pull the last 2 weeks of data from purpleair's API.
2. Run data cleaner to order data by timestamp and remove duplicates.
(Sensors.txt specifies which sensors to pull from and data.txt is where the sensor data will be written to.)
