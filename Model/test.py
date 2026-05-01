import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "agri.db")

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("DELETE FROM translation_cache")
conn.commit()

print("✅ Translation cache cleared")
