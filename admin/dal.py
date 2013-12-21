__author__ = 'akil.harris'

import csv
import argparse
import json
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
        self.data2 = {
            'candidates': set(),
            'contributors': set(),
            'employers': set(),
            'contributions': set(),
            'intermediaries': set(),
            'occupations': set()
        }
        self.distinct = {
            'candidates': False,
            'contributors': False,
            'employers': False,
            'contributions': False,
            'intermediaries': False,
            'occupations': False
        }
        self.quick_sort = None
        self.db = PostgreSQLConnector('nyc_campaign_finance', 'akil', '12345', 'localhost', '5432')

    def set_all_data(self, all_data):
        self.all_data = all_data

    def set_data(self, raw_data):
        self.raw_data = raw_data

    def set_distinct(self, cols):
        for col in cols:
            if col == 'candidates':
                self.distinct['candidates'] = True
            elif col == 'contributors':
                self.distinct['contributors'] = True
            elif col == 'employers':
                self.distinct['employers'] = True
            elif col == 'contributions':
                self.distinct['contributions'] = True
            elif col == 'intermediaries':
                self.distinct['intermediaries'] = True
            elif col == 'occupations':
                self.distinct['occupations'] = True

    def build_candidates(self, line_data):
        candidate = Candidate(line_data[4], line_data[1], line_data[2], line_data[3], line_data[5],
                              line_data[6])

        if self.distinct['candidates']:
            if binary_search(self.data['candidates'], candidate, len(self.data['candidates'])-1, 0) is None:
                self.data['candidates'].append(candidate)
                self.data['candidates'] = QuickSort(self.data['candidates']).items
                print(candidate)
        return candidate

    def print_candidates(self):
        for candidate in self.data['candidates']:
            print(candidate)

    def build_employers(self, line_data, cursor):
        employers = []
        added_employer = False

        # Contributor Fields
        employer = Employer(line_data[23], line_data[24], line_data[25], line_data[26], line_data[27])
        employer.employer_id = self.get_employer_id(employer, cursor)
        if self.distinct['employers']:
            if binary_search(self.data['employers'], employer, len(self.data['employers'])-1, 0) is None:
                added_employer = True
                print(employer)
                self.data['employers'].append(employer)

        employers.append(employer)
        # self.save_employer(employer, cursor)

        # Intermediary Fields
        if len(line_data) >= 40 and line_data[40] is not '':
            employer2 = Employer(line_data[40], line_data[41], line_data[42], line_data[43], line_data[44])
            employer2.employer_id = self.get_employer_id(employer2, cursor)
            if self.distinct['employers']:
                if binary_search(self.data['employers'], employer2, len(self.data['employers'])-1, 0) is None:
                    added_employer = True
                    print(employer2)
                    self.data['employers'].append(employer2)
            employers.append(employer2)
            # self.save_employer(employer2, cursor)
        else:
            employers.append(None)

        if added_employer:
            self.data['employers'] = QuickSort(self.data['employers']).items

        return employers

    def print_employers(self):
        for employer in self.data['employers']:
            print(employer)

    def build_occupations(self, line_data, cursor):
        added_occupation = False
        name1 = line_data[22].title()
        name2 = ""
        if len(line_data) >= 45:
            name2 = line_data[45].title()
        occupations = []
        occupation = Occupation(name1)
        occupation.occupation_id = self.get_occupation_id(occupation, cursor)
        if self.distinct['occupations']:
            if binary_search(self.data['occupations'], occupation, len(self.data['occupations'])-1, 0) is None:
                added_occupation = True
                print(occupation)
                self.data['occupations'].append(occupation)

        occupations.append(occupation)
        # self.save_occupation(occupation, cursor)

        if name1 != name2:
            occupation2 = Occupation(name2)
            occupation2.occupation_id = self.get_occupation_id(occupation2, cursor)
            if self.distinct['occupations']:
                if binary_search(self.data['occupations'], occupation2, len(self.data['occupations'])-1, 0) is None:
                    added_occupation = True
                    print(occupation2)
                    self.data['occupations'].append(occupation2)
            occupations.append(occupation2)
            # self.save_occupation(occupation2, cursor)
        elif name2 is not '':
            occupations.append(occupation)
        else:
            occupations.append(None)

        if added_occupation:
            self.data['occupations'] = QuickSort(self.data['occupations']).items

        return occupations

    def print_occupations(self):
        for occupation in self.data['occupations']:
            print(occupation)

    def build_intermediaries(self, line_data, employer_id, occupation_id, employer, occupation):

        number = line_data[32]
        name = line_data[33].title()
        street_no = line_data[34]
        street_name = line_data[35]
        apartment = line_data[36]
        city = line_data[37]
        state = line_data[38]
        zip_code = line_data[39]
        name_code = line_data[51]
        intermediary = Intermediary(number, name, street_no, street_name, apartment, city, state, zip_code,
                                    occupation_id, employer_id, name_code)
        intermediary.employer = employer
        intermediary.occupation = occupation
        if self.distinct['intermediaries']:
            if binary_search(self.data['intermediaries'], intermediary, len(self.data['intermediaries'])-1, 0) is None:
                print("intermediary: " + str(intermediary))
                self.data['intermediaries'].append(intermediary)
                self.data['intermediaries'] = QuickSort(self.data['intermediaries']).items
        return intermediary

    def print_intermediaries(self):
        for intermediary in self.data['intermediaries']:
            print(intermediary)

    def build_contributors(self, line_data, employer_id, occupation_id, employer, occupation, cursor):
        name = line_data[13]
        c_code = line_data[14]
        street_no = line_data[15]
        street_name = line_data[16]
        apartment = line_data[17]
        borough_code = line_data[18]
        city = line_data[19]
        state = line_data[20]
        zip_code = line_data[21]
        contributor = Contributor(name, c_code, street_no, street_name, apartment, borough_code, city, state, zip_code, employer_id, occupation_id)
        contributor.employer = employer
        contributor.occupation = occupation

        if self.distinct['contributors']:
            # if binary_search(self.data['contributors'], contributor, len(self.data['contributors'])-1, 0) is None:
            if self.fetch_contributor_by_name_zip_c_code_occupation(contributor, cursor) is None:
                self.data['contributors'].append(contributor)
                print(contributor)
                self.save_contributor(contributor, cursor)
                # self.data['contributors'] = QuickSort(self.data['contributors']).items
        return contributor

    def print_contributors(self):
        for contributor in self.data['contributors']:
            print(contributor)

    def build_contributions(self, line_data, candidate_id, contributor_id, intermediary_id):
            schedule = line_data[7]
            pageno = line_data[8]
            seqno = line_data[9]
            refno = line_data[10]
            date = line_data[11]
            refdate = line_data[12]
            amount = line_data[28]
            match_amount = line_data[29]
            prev_total = line_data[30]
            payment_method_id = line_data[31]
            purpose_code_id = line_data[46]
            exempt_code_id = line_data[47]
            adjustment_type_code_id = line_data[48]
            is_runoff = line_data[49]
            is_segregated = line_data[50]
            election_cycle = line_data[0]

            contribution = Contribution(candidate_id, contributor_id, intermediary_id, schedule, pageno,
                                        seqno, refno, date, refdate, amount, match_amount, prev_total,
                                        payment_method_id, purpose_code_id, exempt_code_id,
                                        adjustment_type_code_id, is_runoff, is_segregated, election_cycle)

            self.data['contributions'].append(contribution)
            return contribution

    def print_contributions(self):
        for contribution in self.data['contributions']:
            print(contribution)

    def build_all(self):
        cursor = self.db.get_cursor()
        intermediary_occupation_id = -1
        intermediary_employer_id = -1
        contributor_employer_id = -1
        contributor_occupation_id = -1
        intermediary_employer = None
        intermediary_occupation = None
        contributor_employer = None
        contributor_occupation = None

        intermediary = None
        candidate = None
        contributor = None
        employers = []
        occupations = []
        x = 0
        for line_data in self.all_data:

            # if line_data[4] is not '':
            #     candidate = self.build_candidates(line_data)

            if line_data[23] is not '':
                employers = self.build_employers(line_data, cursor)

            if line_data[22] is not '':
                occupations = self.build_occupations(line_data, cursor)

            # if line_data[33] is not '':
            #     if len(employers) > 1 and employers[1] is not None:
            #         intermediary_employer_id = employers[1].employer_id
            #         intermediary_employer = employers[1].name
            #     if len(occupations) > 1 and occupations[1] is not None:
            #         intermediary_occupation_id = occupations[1].occupation_id
            #         intermediary_occupation = occupations[1].name
            #     intermediary = self.build_intermediaries(line_data,
            #                                              intermediary_employer_id, intermediary_occupation_id,
            #                                              intermediary_employer, intermediary_occupation)

            if line_data[13] is not '':
                if len(employers) > 0 and employers[0] is not None:
                    contributor_employer_id = employers[0].employer_id
                    contributor_employer = employers[0].name
                if len(occupations) > 0 and occupations[0] is not None:
                    contributor_occupation_id = occupations[0].occupation_id
                    contributor_occupation = occupations[0].name
                contributor = self.build_contributors(line_data, contributor_employer_id, contributor_occupation_id,
                                                      contributor_employer, contributor_occupation, cursor)


            # # print("------------------------------------------------------------------------------------------")
            # intermediary_id = 0
            # if intermediary is not None:
            #     intermediary_id = self.get_intermediary_id(intermediary, cursor)
            # #     print("intermediary: " + str(intermediary) + ":   " + str(intermediary_id))
            #
            # candidate_id = 0
            # if candidate is not None:
            #     candidate_id = self.get_candidate_id(candidate, cursor)
            # #     print("candidate: " + str(candidate) + ":   " + str(candidate_id))
            #
            # contributor_id = 0
            # if contributor is not None:
            #     contributor_id = self.get_contributor_id(contributor, cursor)
            # #     print("contributor: " + str(contributor) + ":   " + str(contributor_id))
            #
            # contribution = self.build_contributions(line_data, candidate_id, contributor_id, intermediary_id)
            # print("contribution: " + str(contribution))
            # print("------------------------------------------------------------------------------------------")
            # print("")
            # if x > 10:
            #     break
            # else:
            #     x += 1

    def save(self, types_to_save, file_id):
        for save_type in types_to_save:
            timestamp = datetime.datetime.now().strftime("%d_%m_%Y_%H%M%S")
            f = open('data_files/' + str(file_id) + '_' + save_type + '_' + str(timestamp) + '.csv', 'w', encoding='utf-8')
            data = []
            line = ''
            objects = []

            if save_type == 'candidates':
                objects = self.data['candidates']
            elif save_type == 'employers':
                objects = self.data['employers']
            elif save_type == 'occupations':
                objects = self.data['occupations']
            elif save_type == 'intermediaries':
                objects = self.data['intermediaries']
            elif save_type == 'contributors':
                objects = self.data['contributors']
            elif save_type == 'contributions':
                objects = self.data['contributions']

            for obj in objects:
                if obj is None:
                    continue

                if save_type == 'candidates':
                    print(obj)
                    line = str(obj.office_id) + "," + obj.office + "," + obj.cfb_id + "," + obj.canclass + "," +\
                           obj.committee + "," + obj.filing + "," + obj.name + "\n"
                elif save_type == 'employers':
                    line = obj.name + "," + obj.street_no + "," + obj.street_name + "," + obj.city + "," + \
                           obj.state + "\n"
                elif save_type == 'occupations':
                    line = obj.name + "," + obj.search_name + "\n"
                elif save_type == 'intermediaries':
                    if obj.employer_id == -1:
                        obj.employer_id = "NULL"
                    if obj.employer is None:
                        obj.employer = "NULL"
                    if obj.occupation_id == -1:
                        obj.occupation_id = "NULL"
                    if obj.occupation is None:
                        obj.occupation = "NULL"
                    line = obj.name + "," + obj.street_no + "," + obj.street_name + "," + obj.apartment + "," + \
                           obj.city + "," + obj.state + "," + obj.zip_code + "," + obj.occupation + "," +\
                           str(obj.occupation_id) + "," + obj.employer + "," + str(obj.employer_id) + "," +\
                           obj.name_code + "\n"
                elif save_type == 'contributors':
                    if obj.employer_id == -1:
                        obj.employer_id = "NULL"
                    if obj.employer is None:
                        obj.employer = "NULL"
                    if obj.occupation_id == -1:
                        obj.occupation_id = "NULL"
                    if obj.occupation is None:
                        obj.occupation = "NULL"
                    line = obj.name + "," + obj.c_code + "," + obj.street_no + "," + obj.street_name + "," +\
                           obj.apartment + "," + obj.city + "," + obj.state + "," + obj.zip_code + "," +\
                           obj.occupation + "," + str(obj.occupation_id) + "," + obj.employer + "," +\
                           str(obj.employer_id) + "\n"
                elif save_type == 'contributions':
                    if obj.intermediary_id == -1 or obj.intermediary_id == 0:
                        obj.intermediary_id = "NULL"

                    if obj.candidate_id == 0 or obj.candidate_id == -1:
                        continue

                    if obj.contributor_id == 0 or obj.contributor_id == -1:
                        continue

                    line = obj.schedule + "," + obj.pageno + "," + obj.seqno + "," + obj.refno + "," + str(obj.date) +\
                           "," + str(obj.refdate) + "," + str(obj.amount) + "," + str(obj.match_amount) + "," +\
                           str(obj.prev_total) + "," + str(obj.payment_method_id) + "," + obj.payment_method + "," +\
                           obj.purpose_code_id + "," + obj.purpose_code + "," + obj.exempt_code_id + "','" +\
                           obj.adjustment_type_code_id + "," + str(obj.is_runoff) + "," + str(obj.is_segregated) +\
                           "," + str(obj.candidate_id) + "," + str(obj.contributor_id) + "," +\
                           str(obj.intermediary_id) + "," + obj.election_cycle + "\n"
                print(line)
                data.append(line)
            f.writelines(data)

    def save_candidates(self, file_id):
        timestamp = datetime.datetime.now().strftime("%d_%m_%Y_%H%M%S")
        f = open('data_files/' + str(file_id) + '_candidates_' + str(timestamp) + '.csv', 'w', encoding='utf-8')
        data = []
        for candidate in self.data['candidates']:
            data.append(candidate.office_id + "," + candidate.office + "," + candidate.cfb_id + "," + candidate.canclass + "," + candidate.committee + "," + candidate.filing + "," + candidate.name + "\n")
        f.writelines(data)

    def save_employers(self, file_id):
        timestamp = datetime.datetime.now().strftime("%d_%m_%Y_%H%M%S")
        f = open('data_files/' + str(file_id) + '_employers_' + str(timestamp) + '.csv', 'w', encoding='utf-8')
        data = []
        for employer in self.data['employers']:
            data.append(employer.name + "," + employer.street_no + "," + employer.street_name + "," + employer.city + "," + employer.state + "\n")
        f.writelines(data)

    def save_occupations(self, file_id):
        timestamp = datetime.datetime.now().strftime("%d_%m_%Y_%H%M%S")
        f = open('data_files/' + str(file_id) + '_occupations_' + str(timestamp) + '.csv', 'w', encoding='utf-8')
        data = []
        for occupation in self.data['occupations']:
            data.append(occupation.name + "," + occupation.search_name + "\n")
        f.writelines(data)

    def save_intermediaries(self, file_id):
        timestamp = datetime.datetime.now().strftime("%d_%m_%Y_%H%M%S")
        f = open('data_files/' + str(file_id) + '_intermediaries_' + str(timestamp) + '.csv', 'w', encoding='utf-8')
        data = []
        for intermediary in self.data['intermediaries']:

            if intermediary.name_code is None:
                intermediary.name_code = "NULL"
            if intermediary.employer_id is -1:
                intermediary.employer_id = "NULL"
            if intermediary.employer is None:
                intermediary.employer = "NULL"
            if intermediary.occupation_id is -1:
                intermediary.occupation_id = "NULL"
            if intermediary.occupation is None:
                intermediary.occupation = "NULL"
            data.append(intermediary.name + "," + intermediary.street_no + "," + intermediary.street_name + "," +
                        intermediary.apartment + "," + intermediary.city + "," + intermediary.state + "," +
                        intermediary.zip_code + "," + intermediary.occupation + "," + str(intermediary.occupation_id)
                        + "," + intermediary.employer.strip() + "," + str(intermediary.employer_id) + "," +
                        intermediary.name_code + "\n")
        f.writelines(data)

    def save_contributors(self, file_id):
        timestamp = datetime.datetime.now().strftime("%d_%m_%Y_%H%M%S")
        f = open('data_files/' + str(file_id) + '_contributors_' + str(timestamp) + '.csv', 'w', encoding='utf-8')
        data = []
        for contributor in self.data['contributors']:
            if contributor.employer_id is None:
                contributor.employer_id = "NULL"
            if contributor.employer is None:
                contributor.employer = "NULL"
            if contributor.occupation_id is None:
                contributor.occupation_id = "NULL"
            if contributor.occupation is None:
                contributor.occupation = "NULL"
            data.append(contributor.name + "," + contributor.c_code + "," + contributor.street_no + ","
                        + contributor.street_name + "," + contributor.apartment + "," + contributor.city
                        + "," + contributor.state + "," + contributor.zip_code + "," + contributor.occupation
                        + "," + str(contributor.occupation_id) + "," + contributor.employer + "," +
                        str(contributor.employer_id) + "\n")
        f.writelines(data)

    def save_contributions(self, file_id):
        timestamp = datetime.datetime.now().strftime("%d_%m_%Y_%H%M%S")
        f = open('data_files/' + str(file_id) + '_contributions_' + str(timestamp) + '.csv', 'w', encoding='utf-8')
        data = []
        for contribution in self.data['contributions']:
            if contribution.intermediary_id == -1 or contribution.intermediary_id == 0:
                contribution.intermediary_id = "NULL"

            if contribution.candidate_id == 0 or contribution.candidate_id == -1:
                continue

            if contribution.contributor_id == 0 or contribution.contributor_id == -1:
                continue

            data.append(contribution.schedule + "," + contribution.pageno + "," + contribution.seqno + "," +
                        contribution.refno + "," + str(contribution.date) + "," + str(contribution.refdate) + "," +
                        str(contribution.amount) + "," + str(contribution.match_amount) + "," +
                        str(contribution.prev_total) + "," + str(contribution.payment_method_id) + "," +
                        contribution.payment_method + "," + contribution.purpose_code_id + "," +
                        contribution.purpose_code + "," + contribution.exempt_code_id + "','" +
                        contribution.adjustment_type_code_id + "," + str(contribution.is_runoff) + "," +
                        str(contribution.is_segregated) + "," + str(contribution.candidate_id) + "," +
                        str(contribution.contributor_id) + "," + str(contribution.intermediary_id) + "," +
                        contribution.election_cycle + "\n")
        f.writelines(data)

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

    x = 0

    print(datetime.datetime.now())
    ds2013 = DataSet()
    for file in file_names:
        print("****************************************************")
        print("Reading File: " + file)
        print(datetime.datetime.now())

        fr = FileReader(file)
        fr.read_file()
        for data in fr.raw_data:
            ds2013.set_all_data(data)
            ds2013.set_distinct(('contributors',))
            ds2013.build_all()
        #     break
        # break
        print(datetime.datetime.now())
        print("****************************************************")
        print("")
    ds2013.save(('contributors',), x)
    print(datetime.datetime.now())

parser = argparse.ArgumentParser(description='Parse NYC Campaign Finance CSVs.')
parser.add_argument('arg_files', metavar='file_name.csv', type=str, nargs="+", help='A list of CSV files to parse.')
args = parser.parse_args()
load_files(args.arg_files)

# data_files\1.csv data_files\2.csv data_files\3.csv data_files\4.csv data_files\5.csv data_files\6.csv data_files\7.csv data_files\8.csv data_files\9.csv data_files\10.csv data_files\11.csv data_files\12.csv data_files\13.csv data_files\14.csv