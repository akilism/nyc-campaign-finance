__author__ = 'akil.harris'

import csv
#import psycopg2
from data_objects import *
from data_structures import *

LINES_PER_BATCH = 500


class FileReader:

    def __init__(self, filename):
        self.filename = filename
        self.raw_data = []

    def read_file(self):
        with open(self.filename, encoding='utf8', newline='') as csvfile:
            dialect = csv.Sniffer().sniff(csvfile.read(1024))
            csvfile.seek(0)
            data_reader = csv.reader(csvfile, dialect)
            temp_data = []
            x = 0

            while x < LINES_PER_BATCH + 1:
                try:
                    if data_reader.line_num == 0:
                        data_reader.__next__()
                    else:
                        temp_data.append(data_reader.__next__())
                except StopIteration:
                    break

                if x == LINES_PER_BATCH:
                    x = 0
                    self.raw_data.append(temp_data[:])
                    temp_data = []
                else:
                    x += 1

            #put the last bit in also.
            self.raw_data.append(temp_data[:])
            print(len(self.raw_data))
            # for data in data_reader:
            #     if data_reader.line_num != 1:
            #         self.raw_data.append(data)

    def __str__(self):
        return self.filename


class DataSet:

    def __init__(self):
        self.raw_data = []
        self.all_data = None
        self.data = {
            'candidates': [],
            'contributors': [],
            'employers': [],
            'contributions': [],
            'intermediaries': [],
            'occupations': []
        }
        self.quick_sort = None

    def set_all_data(self, all_data):
        self.all_data = all_data

    def set_data(self, raw_data):
        self.raw_data = raw_data

    def build_candidates(self):
        for data in self.raw_data:
            name = data[4]
            office_id = data[1]
            cfb_id = data[2]
            canclass = data[3]
            committee = data[5]
            filing = data[6]
            candidate = Candidate(name, office_id, cfb_id, canclass, committee, filing)

            if self.candidate_missing(candidate):
                self.data['candidates'].append(candidate)

    def candidate_missing(self, candidate):
        for stored_candidate in self.data['candidates']:
            if stored_candidate.cfb_id == candidate.cfb_id:
                return False
        return True

    def print_candidates(self):
        for candidate in self.data['candidates']:
            print(candidate)

    def build_employers(self):
        for data in self.raw_data:
            name = data[23]
            street_no = data[24]
            street_name = data[25]
            city = data[26]
            state = data[27]
            employer = Employer(name, street_no, street_name, city, state)
            if self.missing_employer(employer):
                self.data['employers'].append(employer)

    def missing_employer(self, employer):
        for stored_employer in self.data['employers']:
            if stored_employer.is_self(employer):
                return False
        return True

    def print_employers(self):
        for employer in self.data['employers']:
            print(employer)

    def build_occupations(self):
        for data in self.raw_data:
            name1 = data[22].title()
            name2 = data[45].title()
            occupation = Occupation(name1)

            if self.missing_occupation(occupation):
                self.data['occupations'].append(occupation)

            if name1 != name2:
                occupation2 = Occupation(name2)
                if self.missing_occupation(occupation2):
                    self.data['occupations'].append(occupation2)

    def missing_occupation(self, occupation):
        for stored_occupation in self.data['occupations']:
            if stored_occupation.is_self(occupation):
                return False
        return True

    def print_occupations(self):
        for occupation in self.data['occupations']:
            print(occupation)

    def build_intermediaries(self):
        for data in self.raw_data:
            if data[33] != '':
                number = data[32].title()
                name = data[33]
                street_no = data[34]
                street_name = data[35]
                apartment = data[36]
                city = data[37]
                state = data[38]
                zip_code = data[39]
                name_code = data[51]
                #TODO setup database to save these then fill in based on value in csv
                occupation_id = 0
                employer_id = 0
                intermediary = Intermediary(number, name, street_no, street_name, apartment, city, state, zip_code, occupation_id, employer_id, name_code)

                if self.intermediary_missing(intermediary):
                    self.data['intermediaries'].append(intermediary)

    def intermediary_missing(self, intermediary):
        for stored_intermediary in self.data['intermediaries']:
            if stored_intermediary.is_self(intermediary):
                return False
        return True

    def print_intermediaries(self):
        for intermediary in self.data['intermediaries']:
            print(intermediary)

    def build_contributors(self):
        for data in self.raw_data:
            if data[33] != '':
                name = data[13]
                c_code = data[14]
                street_no = data[15]
                street_name = data[16]
                apartment = data[17]
                borough_code = data[18]
                city = data[19]
                state = data[20]
                zip_code = data[21]
                #TODO setup database to save these then fill in based on value in csv
                occupation_id = 0
                employer_id = 0
                contributor = Contributor(name, c_code, street_no, street_name, apartment, borough_code, city, state, zip_code, employer_id, occupation_id)

                if self.contributor_missing(contributor):
                    self.data['contributors'].append(contributor)

    def contributor_missing(self, contributor):
        for stored_contributor in self.data['contributors']:
            if stored_contributor.is_self(contributor):
                return False
        return True

    def print_contributors(self):
        for contributor in self.data['contributors']:
            print(contributor)

    def build_contributions(self):
        for data in self.raw_data:
            schedule = data[7]
            pageno = data[8]
            seqno = data[9]
            refno = data[10]
            date = data[11]
            refdate = data[12]
            amount = data[28]
            match_amount = data[29]
            prev_total = data[30]
            payment_method_id = data[31]
            purpose_code_id = data[46]
            exempt_code_id = data[47]
            adjustment_type_code_id = data[48]
            is_runoff = data[49]
            is_segregated = data[50]
            election_cycle = data[0]
            #TODO setup database to save these then fill in based on value in csv
            candidate_id = 0
            contributor_id = 0
            intermediary_id = 0
            contribution = Contribution(candidate_id, contributor_id, intermediary_id, schedule, pageno, seqno, refno, date, refdate, amount, match_amount, prev_total, payment_method_id, purpose_code_id, exempt_code_id, adjustment_type_code_id, is_runoff, is_segregated, election_cycle)

            #if self.contribution_missing(contribution):
            self.data['contributions'].append(contribution)

    def contribution_missing(self, contribution):
        for stored_contribution in self.data['contributions']:
            if stored_contribution.is_self(contribution):
                return False
        return True

    def print_contributions(self):
        for contribution in self.data['contributions']:
            print(contribution)

    def build_all(self):

        for line_data in self.all_data:

            if line_data[4] is not '':
                candidate = Candidate(line_data[4], line_data[1], line_data[2], line_data[3], line_data[5], line_data[6])
                if binary_search(self.data['candidates'], candidate, len(self.data['candidates'])-1, 0) is None:
                    self.data['candidates'].append(candidate)
                    self.data['candidates'] = QuickSort(self.data['candidates']).items

            if line_data[23] is not '':
                employer = Employer(line_data[23], line_data[24], line_data[25], line_data[26], line_data[27])
                if binary_search(self.data['employers'], employer, len(self.data['employers'])-1, 0) is None:
                    self.data['employers'].append(employer)
                    self.data['employers'] = QuickSort(self.data['employers']).items

            if line_data[22] is not '':
                added_occupation = False
                occupation = Occupation(line_data[22].title())
                if binary_search(self.data['occupations'], occupation, len(self.data['occupations'])-1, 0) is None:
                    self.data['occupations'].append(occupation)
                    added_occupation = True

                if not line_data[22].title() != line_data[45].title():
                    occupation2 = Occupation(line_data[45].title())
                    if binary_search(self.data['occupations'], occupation2, len(self.data['occupations'])-1, 0) is None:
                        self.data['occupations'].append(occupation2)
                        added_occupation = True

                if added_occupation:
                    self.data['occupations'] = QuickSort(self.data['occupations']).items

            if line_data[33] is not '':
                #TODO setup database to save these then fill in based on value in csv
                intermediary = Intermediary(line_data[32].title(), line_data[33], line_data[34], line_data[35], line_data[36], line_data[37], line_data[38], line_data[39], 0, 0, line_data[51])
                if binary_search(self.data['intermediaries'], intermediary, len(self.data['intermediaries'])-1, 0) is None:
                    self.data['intermediaries'].append(intermediary)
                    self.data['intermediaries'] = QuickSort(self.data['intermediaries']).items

            if line_data[13] is not '':
                #TODO setup database to save these then fill in based on value in csv
                contributor = Contributor(line_data[13], line_data[14], line_data[15], line_data[16], line_data[17], line_data[18], line_data[19], line_data[20], line_data[21], 0, 0)
                if binary_search(self.data['contributors'], contributor, len(self.data['contributors'])-1, 0) is None:
                    self.data['contributors'].append(contributor)
                    self.data['contributors'] = QuickSort(self.data['contributors']).items

            #TODO setup database to save these then fill in based on value in csv
            contribution = Contribution(0, 0, 0, line_data[7], line_data[8], line_data[9], line_data[10], line_data[11], line_data[12], line_data[28], line_data[29], line_data[30], line_data[31], line_data[46], line_data[47], line_data[48], line_data[49], line_data[50], line_data[0])
            self.data['contributions'].append(contribution)


def binary_search(search_data, key, hi, lo):

    if len(search_data) == 0:
        return None

    if hi < lo:
        return None

    mid = math.floor((lo + hi) / 2)

    if search_data[mid].compare_to(key) > 0:
        return binary_search(search_data, key, mid-1, lo)
    elif search_data[mid].compare_to(key) < 0:
        return binary_search(search_data, key, hi, mid+1)
    else:
        return search_data[mid]


# class PostgreSQLConnector:
#
#     def __init__(self):
#         self.conn = psycopg2.connect("dbname=nyc_campaign_finance user=akil password=d3l3ting host=localhost port=5432")
#         self.cur = self.conn.cursor()
#
#     def get_cursor(self):
#         return self.cur
#
#     def close_cursor(self):
#         self.cur.close()
#
#     def open_cursor(self):
#         self.close_cursor()
#         self.cur = self.conn.cursor()
#
#     def close_connection(self):
#         self.close_cursor()
#         self.conn.close()
#
#     def commit_changes(self):
#         self.conn.commit()


fr = FileReader('sample0.csv')
fr.read_file()
print(str(fr))

ds2013 = DataSet()

# for data in fr.raw_data:
#     ds2013.set_data(data)
#     ds2013.build_candidates()
#     ds2013.build_employers()
#     ds2013.build_occupations()
#     ds2013.build_intermediaries()
#     ds2013.build_contributors()
#     ds2013.build_contributions()

# print(fr.raw_data[0])

x = 0
for data in fr.raw_data:
    ds2013.set_all_data(data)
    ds2013.build_all()
    x += 1
    if x > 20:
        break

ds2013.print_candidates()
print("*************************")
print("*************************")
print("*************************")
ds2013.print_occupations()
# ds2013.print_intermediaries()
# ds2013.print_contributors()
# ds2013.print_contributions()
