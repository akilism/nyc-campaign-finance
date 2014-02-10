__author__ = 'akil.harris'

import psycopg2

class PostgreSQLConnector:

    def __init__(self, db_name, user, passwd, host, port):
        self.conn = psycopg2.connect("dbname=" + db_name + " user=" + user + " password=" + passwd + " host=" + host + " port=" + port)
        self.cur = self.conn.cursor()

    def get_cursor(self):
        return self.cur

    def close_cursor(self):
        self.cur.close()

    def open_cursor(self):
        self.close_cursor()
        self.cur = self.conn.cursor()

    def close_connection(self):
        self.close_cursor()
        self.conn.close()

    def commit_changes(self):
        self.conn.commit()

    def cursor_closed(self):
        return self.cur.closed
