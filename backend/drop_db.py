import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='3011',
        charset='utf8mb4'
    )
    with connection.cursor() as cursor:
        cursor.execute("DROP DATABASE IF EXISTS finance_advisor;")
        cursor.execute("CREATE DATABASE finance_advisor;")
    connection.commit()
    print("Database finance_advisor completely dropped and recreated.")
finally:
    connection.close()
