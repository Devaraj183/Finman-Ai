import pymysql

try:
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='3011',
        database='finance_advisor',
        charset='utf8mb4'
    )
    with connection.cursor() as cursor:
        try:
            cursor.execute("ALTER TABLE user_details ADD COLUMN photo LONGTEXT;")
            print("Successfully added photo column to user_details table.")
        except Exception as e:
            print(f"Column might already exist or error occurred: {e}")
    connection.commit()
finally:
    connection.close()
