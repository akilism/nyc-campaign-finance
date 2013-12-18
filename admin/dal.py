__author__ = 'akil.harris'

import csv
import argparse

import psycopg2

from admin.data_objects import *
from admin.data_structures import *


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
        self.db = PostgreSQLConnector('nyc_campaign_finance', 'akil', '12345', 'localhost', '5432')

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
        cursor = self.db.get_cursor()
        occupation = None
        occupation2 = None
        employer = None
        employer2 = None
        intermediary = None
        occupation_id = 0
        occupation2_id = 0
        employer_id = 0
        employer2_id = 0
        for line_data in self.all_data:

            # if line_data[4] is not '':
                # candidate = Candidate(line_data[4], line_data[1], line_data[2], line_data[3], line_data[5],
                #                       line_data[6])
                # candidate_id = self.get_candidate_id(candidate, cursor)
                # print(str(candidate) + " : " + str(candidate_id) + " : " + str(candidate.candidate_id))
                # if binary_search(self.data['candidates'], candidate, len(self.data['candidates'])-1, 0) is None:
                #     self.data['candidates'].append(candidate)
                #     self.save_candidate(candidate, cursor)
                #     self.data['candidates'] = QuickSort(self.data['candidates']).items
            #
            added_employer = False
            if line_data[23] is not '':
            #     # Contributor Fields
                employer = Employer(line_data[23], line_data[24], line_data[25], line_data[26], line_data[27])
                # if binary_search(self.data['employers'], employer, len(self.data['employers'])-1, 0) is None:
                #     self.data['employers'].append(employer)
                #     self.save_employer(employer, cursor)
                #     added_employer = True
            #
            # if line_data[40] is not '':
            # #     # Intermediary Fields
            #     employer2 = Employer(line_data[40], line_data[41], line_data[42], line_data[43], line_data[44])
            #     # self.data['employers'].append(employer2)
            #     # self.save_employer(employer2, cursor)
            #     # added_employer = True

            # if added_employer:
            #     self.data['employers'] = QuickSort(self.data['employers']).items

            # added_occupation = False
            if line_data[22] is not '':
                occupation = Occupation(line_data[22].title())
                # if binary_search(self.data['occupations'], occupation, len(self.data['occupations'])-1, 0) is None:
                #     self.data['occupations'].append(occupation)
                #     self.save_occupation(occupation, cursor)
                #     added_occupation = True
            #
            # if not line_data[22].title() != line_data[45].title():
            # if line_data[45] is not '':
            #     occupation2 = Occupation(line_data[45].title())
            #     # if binary_search(self.data['occupations'], occupation2, len(self.data['occupations'])-1, 0) is None:
            #     #     self.data['occupations'].append(occupation2)
            #     #     self.save_occupation(occupation2, cursor)
            #     #     added_occupation = True
            #
            # # if added_occupation:
            # #     self.data['occupations'] = QuickSort(self.data['occupations']).items
            # #
            # if line_data[33] is not '':
            #     occupation2_id = -1
            #     if occupation2 is not None:
            #         occupation2_id = self.get_occupation_id(occupation2, cursor)
            #
            #     employer2_id = -1
            #     if employer2 is not None:
            #         employer2_id = self.get_employer_id(employer2, cursor)
            #
            #     intermediary = Intermediary(line_data[32].title(), line_data[33], line_data[34], line_data[35],
            #                                 line_data[36], line_data[37], line_data[38], line_data[39], occupation2_id,
            #                                 employer2_id, line_data[51])
            #     if binary_search(self.data['intermediaries'], intermediary, len(self.data['intermediaries'])-1, 0) is None:
            #         self.data['intermediaries'].append(intermediary)
            #         if employer2 is not None:
            #             intermediary.employer = employer2.name
            #         if occupation2 is not None:
            #             intermediary.occupation = occupation2.name
            #         self.save_intermediary(intermediary, cursor)
            #         self.data['intermediaries'] = QuickSort(self.data['intermediaries']).items

            # contributor_id = 0
            if line_data[13] is not '':
                occupation_id = -1
                if occupation is not None:
                    occupation_id = self.get_occupation_id(occupation, cursor)

                employer_id = -1
                if employer is not None:
                    employer_id = self.get_employer_id(employer, cursor)
                contributor = Contributor(line_data[13], line_data[14], line_data[15], line_data[16], line_data[17],
                                          line_data[18], line_data[19], line_data[20], line_data[21], employer_id,
                                          occupation_id)
                if self.fetch_contributor_by_name_zip_c_code_occupation(contributor, cursor) is None:
                    if employer is not None:
                        contributor.employer = employer.name
                    if occupation is not None:
                        contributor.occupation = occupation.name
            #     #if binary_search(self.data['contributors'], contributor, len(self.data['contributors'])-1, 0) is None:
            #         # self.data['contributors'].append(contributor)
                    self.save_contributor(contributor, cursor)
            #         # self.data['contributors'] = QuickSort(self.data['contributors']).items
            #
            # #TODO setup database to save these then fill in based on value in csv

            # intermediary_id = 0
            # if intermediary is not None:
            #     intermediary.occupation_id = occupation2_id
            #     intermediary_id = self.get_intermediary_id(intermediary, cursor)
            #     # print(str(intermediary) + " : " + str(intermediary_id) + " : " + str(intermediary.intermediary_id))
            # #
            # # print("candidate: " + str(candidate_id))
            # # print("contributor: " + str(contributor_id))
            # # print("intermediary: " + str(intermediary_id))
            #
            # contribution = Contribution(candidate_id, contributor_id, intermediary_id, line_data[7], line_data[8],
            #                             line_data[9], line_data[10], line_data[11], line_data[12], line_data[28],
            #                             line_data[29], line_data[30], line_data[31], line_data[46], line_data[47],
            #                             line_data[48], line_data[49], line_data[50], line_data[0])
            # if int(contributor_id) != 0:
            #     self.save_contribution(contribution, cursor)
            # print(contribution)
            # self.data['contributions'].append(contribution)

    def save_contribution(self, contribution, cursor):
        if contribution.intermediary_id == 0 or contribution.intermediary_id == -1:
            contribution.intermediary_id = None
        try:
            cursor.execute("Insert into contributions (schedule, pageno, seqno, refno, contribution_date, refund_date, "
                           "amount, match_amount, prev_total, payment_method_id, payment_method, purpose_code_id, "
                           "purpose_code, exempt_code_id, adjustment_type_code_id, is_runoff, is_segregated, "
                           "candidate_id, contributor_id, intermediary_id, election_cycle) VALUES "
                           "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                           (contribution.schedule, contribution.pageno, contribution.seqno, contribution.refno
                            , contribution.date, contribution.refdate, contribution.amount, contribution.match_amount
                            , contribution.prev_total, contribution.payment_method_id, contribution.payment_method
                            , contribution.purpose_code_id, contribution.purpose_code, contribution.exempt_code_id
                            , contribution.adjustment_type_code_id, contribution.is_runoff, contribution.is_segregated
                            , contribution.candidate_id, contribution.contributor_id, contribution.intermediary_id
                            , contribution.election_cycle))
            print("Inserting contribution     : " + str(contribution))
        except psycopg2.IntegrityError:
            print("Already inserted   : " + str(contribution))
        self.db.commit_changes()

    def save_candidate(self, candidate, cursor):
        try:
            cursor.execute("Insert into candidates (name, cfb_id, office, office_id, canclass, filing, committee) VALUES  "
                           "( %s, %s, %s, %s, %s, %s, %s)", (candidate.name, candidate.cfb_id, candidate.office,
                                                             candidate.office_id, candidate.canclass, candidate.filing,
                                                             candidate.committee))
            print("Inserting candidate     : " + str(candidate))
        except psycopg2.IntegrityError:
            print("Already inserted   : " + str(candidate))
        self.db.commit_changes()

    def save_occupation(self, occupation, cursor):
        try:
            cursor.execute("Insert into occupations (name, search_name) VALUES (%s, %s)", (occupation.name,
                                                                                           occupation.search_name))
            print("Inserting occupation     : " + str(occupation))
        except psycopg2.IntegrityError:
            print("Already inserted   : " + str(occupation))
        self.db.commit_changes()

    def save_employer(self, employer, cursor):
        try:
            cursor.execute("Insert into employers (name, street_no, street_name, city, state) VALUES  "
                           "( %s, %s, %s, %s, %s)", (employer.name, employer.street_no, employer.street_name,
                                                     employer.city, employer.state))
            print("Inserting employer     : " + str(employer))
        except psycopg2.IntegrityError:
            print("Already inserted   : " + str(employer))
        self.db.commit_changes()

    def save_intermediary(self, intermediary, cursor):
        if intermediary.occupation_id == -1 or intermediary.occupation_id == 0:
            intermediary.occupation_id = 844
            intermediary.occupation = 'None'
        if intermediary.employer_id == -1 or intermediary.employer_id == 0 or intermediary.employer_id is None:
            intermediary.employer_id = 71
            intermediary.employer = 'None'

        try:
            cursor.execute("INSERT INTO intermediaries (name, street_no, street_name, apartment, city, state, zip_code, "
                           "occupation, occupation_id, employer, employer_id, name_code) VALUES  "
                           "( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                           (intermediary.name, intermediary.street_no, intermediary.street_name, intermediary.apartment,
                            intermediary.city, intermediary.state, intermediary.zip_code, intermediary.occupation,
                            intermediary.occupation_id, intermediary.employer, intermediary.employer_id,
                            intermediary.name_code))
            print("Inserting intermediary     : " + str(intermediary))
        except psycopg2.IntegrityError:
            print("Already inserted   : " + str(intermediary))
        self.db.commit_changes()

    def save_contributor(self, contributor, cursor):
        if contributor.occupation_id == -1 or contributor.occupation_id == 0 or contributor.occupation_id is None:
            contributor.occupation_id = 844
            contributor.occupation = 'None'
        if contributor.employer_id == -1 or contributor.employer_id == 0 or contributor.employer_id is None:
            contributor.employer_id = 71
            contributor.employer = 'None'

        try:
            cursor.execute("INSERT INTO contributors (name, c_code, c_type, street_no, street_name, apartment, "
                           "borough_code, city, state, zip_code, occupation, occupation_id, employer, "
                           "employer_id) VALUES  "
                           "( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                            (contributor.name, contributor.c_code, contributor.c_type, contributor.street_no,
                             contributor.street_name, contributor.apartment, contributor.borough_code, contributor.city,
                             contributor.state, contributor.zip_code, contributor.occupation, contributor.occupation_id,
                             contributor.employer, contributor.employer_id))
            print("Inserting contributor     : " + str(contributor))
        except psycopg2.IntegrityError:
            print("Already inserted   : " + str(contributor))
        self.db.commit_changes()

    def get_candidate_id(self, candidate, cursor):
        result = self.fetch_candidate_by_cfb_id(candidate.cfb_id, cursor)
        if result is None:
            return -1
        return result[2]

    def get_occupation_id(self, occupation, cursor):
        result = self.fetch_occupation_by_name(occupation.name, cursor)
        if result is None:
            return -1
        return result[1]

    def get_employer_id(self, employer, cursor):
        result = self.fetch_employer_by_name(employer.name, cursor)
        if result is None:
            return -1
        return result[1]

    def get_intermediary_id(self, intermediary, cursor):
        result = self.fetch_intermediary_by_name_zip_occupation_id(intermediary.name, intermediary.zip_code,
                                                                 intermediary.occupation_id, cursor)
        if result is None:
            return -1
        return result[1]

    def get_contributor_id(self, contributor, cursor):
        result = self.fetch_contributor_by_name_zip_c_code_occupation(contributor, cursor)
        if result is None:
            return -1
        return result[1]

    def fetch_candidate_by_cfb_id(self, cfb_id, cursor):
        cursor.execute("select * from fetch_candidate_by_cfb_id(%s)", [cfb_id])
        result = cursor.fetchone()
        return result

    def fetch_occupation_by_name(self, name, cursor):
        cursor.execute("select * from fetch_occupation_by_name(%s)", [name])
        result = cursor.fetchone()
        return result

    def fetch_employer_by_name(self, name, cursor):
        cursor.execute("select * from fetch_employer_by_name(%s)", [name])
        result = cursor.fetchone()
        return result

    def fetch_intermediary_by_name(self, name, cursor):
        cursor.execute("select * from fetch_intermediary_by_name(%s)", [name])
        result = cursor.fetchone()
        return result

    def fetch_intermediary_by_name_zip_occupation_id(self, name, zip_code, occupation_id, cursor):
        if occupation_id == -1 or occupation_id == 0 or occupation_id is None:
            occupation_id = 844
        # print("select * from fetch_intermediary_by_name_zip_occupation_id(%s, %s, %s)", (name, zip_code, occupation_id))
        cursor.execute("select * from fetch_intermediary_by_name_zip_occupation_id(%s, %s, %s)", (name, zip_code, occupation_id))
        result = cursor.fetchone()

        return result

    def fetch_contributor_by_name_zip_c_code_occupation(self, contributor, cursor):
        if contributor.occupation_id == -1 or contributor.occupation_id == 0 or contributor.occupation_id is None:
            contributor.occupation_id = 844
        if contributor.employer_id == -1 or contributor.employer_id == 0 or contributor.employer_id is None:
            contributor.employer_id = 71
        # print("select * from fetch_contributor_by_name_zip_c_code_occupation(%s, %s, %s, %s)",
        #       (contributor.name, contributor.c_code, contributor.zip_code, contributor.occupation_id))
        cursor.execute("select * from fetch_contributor_by_name_zip_c_code_occupation(%s, %s, %s, %s)",
                      (contributor.name, contributor.c_code, contributor.zip_code, contributor.occupation_id))
        result = cursor.fetchone()
        return result


def load_files(file_names):

    for file in file_names:
        print(file)
        fr = FileReader(file)
        fr.read_file()
        # x = 0
        ds2013 = DataSet()
        for data in fr.raw_data:
            ds2013.set_all_data(data)
            ds2013.build_all()
            # x += 1
            # if x > 0:
            #     break

        # ds2013.print_candidates()
        # ds2013.print_occupations()
        # ds2013.print_intermediaries()
        # ds2013.print_contributors()
        # ds2013.print_contributions()

parser = argparse.ArgumentParser(description='Parse NYC Campaign Finance CSVs.')
parser.add_argument('arg_files', metavar='file_name.csv', type=str, nargs="+", help='A list of CSV files to parse.')
args = parser.parse_args()
load_files(args.arg_files)

# data_files\1.csv data_files\2.csv data_files\3.csv data_files\4.csv data_files\5.csv data_files\6.csv data_files\7.csv data_files\8.csv data_files\9.csv data_files\10.csv data_files\11.csv data_files\12.csv data_files\13.csv data_files\14.csv