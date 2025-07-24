import psycopg2
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="mydb",
    user="root",
    password="00000000")
cur = conn.cursor()
cur.execute("SELECT current_user, current_database();")
print(cur.fetchone())  # should print ('root', 'mydb')
cur.close(); conn.close()