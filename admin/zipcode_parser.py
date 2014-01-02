__author__ = 'akil.harris'

import geojson
import psycopg2
import argparse
import pprint

data = None


def read_file(filenames):
    global data

    for filename in filenames:
        with open(filename, encoding='utf8', newline='') as jsonfile:
            data = geojson.load(jsonfile)

    for feature in data['features']:
        properties = feature['properties']
        geometry = feature['geometry']
        print(properties['postalCode'])
        print(geometry['coordinates'])


def save_zip_code_data():
    # cursor.execute("INSERT INTO intermediaries (name, street_no, street_name, apartment, city, state, zip_code, "
    #                "occupation, occupation_id, employer, employer_id, name_code) VALUES  "
    #                "( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
    #                (intermediary.name, intermediary.street_no, intermediary.street_name, intermediary.apartment,
    #                 intermediary.city, intermediary.state, intermediary.zip_code, intermediary.occupation,
    #                 intermediary.occupation_id, intermediary.employer, intermediary.employer_id,
    #                 intermediary.name_code))

var pgsql = "update"
"zip_codes"
"set"
"po_name = %s"
"state = %s"
"borough = %s"
"state_fips = %s"
"city_fips = %s"
"bldg_postal_code = ''"
"shape_length = %s"
"shape_area = %s"
"api_url = %s"
"geojson = %s"
"where"
"zip_code = %s"

parser = argparse.ArgumentParser(description='Parse geojson files.')
parser.add_argument('arg_files', metavar='file_name.geojson', type=str, nargs="+", help='A list of geojson files to parse.')
args = parser.parse_args()
read_file(['C:\\users\\akil.harris\\repos\\nyc_campaign_finanace\\data_files\\nyc-zip-code-tabulation-areas-polygons-1.geojson'])
