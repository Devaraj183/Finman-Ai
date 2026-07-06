import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='3011',
        charset='utf8mb4'
    )
    with connection.cursor() as cursor:
        cursor.execute("CREATE DATABASE IF NOT EXISTS finance_advisor;")
    connection.commit()
    print("Database finance_advisor created successfully (or already exists).")
finally:
    connection.close()
