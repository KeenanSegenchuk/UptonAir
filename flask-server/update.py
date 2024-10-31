from clean import *
import time

with open("pull.py") as pull:
	exec(pull.read())
time.sleep(10)
clean()