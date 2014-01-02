__author__ = 'akil.harris'

import geojson
import argparse
import pprint
import psycopg2

from admin.postgres_connector import *
data = None


def read_file(filenames):
    global data

    for filename in filenames:
        with open(filename, encoding='utf8', newline='') as jsonfile:
            data = geojson.load(jsonfile)

    for feature in data['features']:
        properties = feature['properties']
    #     geometry = feature['geometry']
        pprint.pprint(properties)
    #     pprint.pprint(geometry['coordinates'])


def save_zip_code_data():
    db = PostgreSQLConnector('nyc_campaign_finance', 'akil', 'c4mpf1y@h', 'localhost', '5432')
    cursor = db.get_cursor()

    for feature in data['features']:
        properties = feature['properties']
        geometry = feature['geometry']

        try:
            cursor.execute("UPDATE zip_codes SET po_name = %s, state = %s, borough = %s, state_fips = %s, city_fips = %s, "
                           "bldg_postal_code = %s, shape_length = %s, shape_area = %s, api_url = %s, geojson = %s WHERE "
                           "zip_code = %s", (properties['PO_NAME'], properties['STATE'], properties['borough'],
                                             properties['ST_FIPS'], properties['CTY_FIPS'],
                                             properties['BLDGpostalCode'], properties['Shape_Leng'],
                                             properties['Shape_Area'], properties['@id'], geojson.dumps(geometry),
                                             properties['postalCode']))
            print("Inserted data for:")
            pprint.pprint(properties)
            print("++++++++++++++++++++++++++++++")
        except psycopg2.IntegrityError:
            print("error inserting " + properties['postalCode'])
        db.commit_changes()

parser = argparse.ArgumentParser(description='Parse geojson files.')
parser.add_argument('arg_files', metavar='file_name.geojson', type=str, nargs="+", help='A list of geojson files to parse.')
args = parser.parse_args()
read_file(['C:\\users\\akil.harris\\repos\\nyc_campaign_finanace\\data_files\\nyc-zip-code-tabulation-areas-polygons-1.geojson'])
save_zip_code_data()