import psycopg2
import os

def pgOpen():
	DB_URL = os.getenv("DB_URL")
	try:
		conn = psycopg2.connect(DB_URL)
	except:
		print("Failed connecting to postgre via env var.")
		conn = psycopg2.connect(host="localhost", dbname="postgres", user="postgres", password="p!ssw0rd", port=5432)
	cur = conn.cursor()
	return [conn, cur]
def pgClose(conn, cur):
	conn.commit()
	cur.close()
	conn.close()

def pgTest():
	conn, cur = pgOpen()
	pgQuery(cur, 1724187600, 1724198400)
	return [",".join([str(x) for x in line]) for line in cur.fetchall()]
	
def pgQuery(cur, start, end):
	cur.execute("""SELECT * FROM readings 
		WHERE time >= %s AND time <= %s;
		""",(start, end)
	)

def pgInit(path):
	def check(conn, cur, table):        
		# SQL query to check if the table exists
		query = """
		SELECT EXISTS (
        		SELECT 1
        		FROM pg_catalog.pg_tables
        		WHERE schemaname = 'public'
        		AND tablename = %s
        	);
		"""
		cur.execute(query,(table,))
		return cur.fetchone()[0]

	def loadFile(path):
		format = [int, int, float, float, float, float, int, int]
		with open(path) as file:
			data = file.read().splitlines()[1:]
		process = lambda line: [format[i](entry) for i, entry in enumerate(line.split(","))]
		data = [process(line) for line in data]
		return data

	conn, cur = pgOpen()
	
	if not check(conn, cur, "readings"):
		cur.execute("""CREATE TABLE IF NOT EXISTS readings (
			time INT,
			id INT,
			humidity NUMERIC(3, 1),
			PMA NUMERIC(6, 3),
			PMB NUMERIC(6, 3),
			PMEPA NUMERIC(6, 3),
			AQI SMALLINT,
			AQIEPA SMALLINT);
		""")
	
		data = loadFile(path)
		cur.executemany("""
		    INSERT INTO readings (time, id, humidity, PMA, PMB, PMEPA, AQI, AQIEPA)
		    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
		""", data)
	print("DATABSE INITIATED")
	pgClose(conn,cur)