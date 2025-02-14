def PMtoAQI(humidity, PMA, PMB):
	if type(humidity) == str:
		humidity = float(humidity)
	if type(PMA) == str:
		PMA = float(PMA)
	if type(PMB) == str:
		PMB = float(PMB)

	avg = round((PMA + PMB)/2, 1)

	f1 = lambda x, h: .524*x-.0862*h+5.75
	f2 = lambda x, h: (.786*(x/20-3/2)+.524*(1-(x/20-3/2)))*x-.0862*h+5.75
	f3 = lambda x, h: .786*x-.0862*h+5.75
	f4 = lambda x, h: (.69*(x/50-21/5)+.786*(1-(x/50-21/5)))*x-.0862*h*(1-(x/50-21/5))+2.966*(x/50-21/5)+5.75*(1-(x/50-21/5))+8.84*.0001*x*x*(x/50-21/5)
	f5 = lambda x, h: 2.966+.69*x+8.84*.0001*x*x
	eparanges  = [30, 50, 210, 260, 10000]
	epaformulas= [f1, f2, f3, f4, f5]
	i = 0
	while i < 5:
		if avg < eparanges[i]:
			break;
		i += 1

	f_AQI = lambda I1, I2, P1, P2, C: ((I2-I1)/(P2-P1))*(C-P1)+I1
	pranges = [0, 9, 35.4, 55.4, 125.4, 225.4, 10000]
	iranges = [0, 50, 100, 150, 200, 300, 500]
	i1 = 0
	i2 = 1
	while i2 < len(pranges):
		if avg <= pranges[i2]:
			AQI = f_AQI(iranges[i1], iranges[i2], pranges[i1], pranges[i2], avg)
			PM_EPA = epaformulas[i](avg, humidity)
			AQI_EPA = f_AQI(iranges[i1], iranges[i2], pranges[i1], pranges[i2], PM_EPA)
			return [str(PM_EPA), str(int(AQI)), str(int(AQI_EPA))]
		i1 += 1
		i2 += 1
	
	