import psycopg2

conn = psycopg2.connect(host="localhost", dbname="postgres", user="postgres", password="p!ssw0rd", port=5432)
cur = conn.cursor()

def query(cur, start, end):
	cur.execute("""SELECT * FROM readings 
		WHERE time >= %s AND time <= %s;
		""",(start, end)
	)

query(cur, 1724187600, 1724198400)

for row in cur.fetchall():
	print(row)


conn.commit()
cur.close()
conn.close()