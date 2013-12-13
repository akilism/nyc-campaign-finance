__author__ = 'akil.harris'


class Candidate:

    def __init__(self, raw_name, office_id, cfb_id, canclass, committee, filing, candidate_id=0):
        self.name = self.reformat_raw_name(raw_name)
        if office_id == 'IS':
            office_id = 7
        self.office_id = int(office_id)
        self.office = self.get_office()
        self.cfb_id = cfb_id
        self.canclass = canclass
        self.committee = committee
        self.filing = filing
        self.candidate_id = candidate_id

    def get_office(self):
        if self.office_id == 1:
            return 'Mayor'
        elif self.office_id == 2:
            return 'Public Advocate'
        elif self.office_id == 3:
            return 'Comptroller'
        elif self.office_id == 4:
            return 'Borough President'
        elif self.office_id == 5:
            return 'City Council'
        elif self.office_id == 6:
            return 'Undeclared'
        elif self.office_id == 7:
            return 'IS'

    def reformat_raw_name(self, raw_name):
        parts = raw_name.split(',')
        if len(parts) > 2:
            return parts[2].strip() + ' ' + parts[0].strip() + ' ' + parts[1].strip()
        elif len(parts) > 1:
            return parts[1].strip() + ' ' + parts[0].strip()
        return raw_name

    def __str__(self):
        return str(self.name) + " - " + str(self.office)

    def is_self(self, other):
        if self.office_id == other.office_id and  \
           self.name == other.name:
            return True
        return False

    def compare_to(self, other):
        if self.office_id > other.office_id:
            return 1
        if self.office_id < other.office_id:
            return -1
        if self.cfb_id > other.cfb_id:
            return 1
        if self.cfb_id < other.cfb_id:
            return -1
        if self.name > other.name:
            return 1
        if self.name < other.name:
            return -1
        return 0


class Contribution:

    def __init__(self, candidate_id, contributor_id, intermediary_id, schedule, pageno, seqno, refno, date, refdate, amount, match_amount, prev_total, payment_method_id, purpose_code_id, exempt_code_id, adjustment_type_code_id, is_runoff, is_segregated, election_cycle, donation_id=0):
        self.schedule = schedule
        self.pageno = pageno
        self.seqno = seqno
        self.refno = refno
        self.date = date
        self.refdate = refdate
        self.amount = amount
        self.match_amount = match_amount
        self.prev_total = prev_total
        self.payment_method_id = payment_method_id
        self.payment_method = self.get_payment_method()
        self.purpose_code_id = purpose_code_id
        self.purpose_code = self.get_purpose_code()
        self.exempt_code_id = exempt_code_id
        self.adjustment_type_code_id = adjustment_type_code_id
        self.is_runoff = is_runoff
        self.is_segregated = is_segregated
        self.candidate_id = candidate_id
        self.contributor_id = contributor_id
        self.intermediary_id = intermediary_id
        self.election_cycle = election_cycle
        self.donation_id = donation_id

    def get_payment_method(self):
        if self.payment_method_id == 1:
            return 'Unknown'
        elif self.payment_method_id == 2:
            return 'Cash'
        elif self.payment_method_id == 3:
            return 'Check'
        elif self.payment_method_id == 4:
            return 'Credit Card'
        elif self.payment_method_id == 5:
            return 'Money Order'

    def get_purpose_code(self):
        if self.purpose_code_id == 'ADVAN':
            return 'Advance Repayment'
        elif self.purpose_code_id == 'CMAIL':
            return 'Campaign Mailings'
        elif self.purpose_code_id == 'CMISC':
            return 'Campaign Miscellaneous'
        elif self.purpose_code_id == 'CNTRB':
            return 'Political Contributions'
        elif self.purpose_code_id == 'COMPL':
            return 'Compliance Cost'
        elif self.purpose_code_id == 'CONSL':
            return 'Campaign Consultants'

    def __str__(self):
        return str(self.amount) + ' from ' + str(self.contributor_id) + ' to ' + str(self.candidate_id)

    def is_self(self, other):
        if self.refno == other.refno and \
           self.pageno == other.pageno and \
           self.seqno == other.seqno and \
           self.amount == other.amount and \
           self.contributor_id == other.contributor_id and \
           self.payment_method_id == other.payment_method_id and \
           self.candidate_id == other.candidate_id:
            return True
        return False


class Contributor:

    def __init__(self, name, c_code, street_no, street_name, apartment, borough_code, city, state, zip_code, employer_id, occupation_id, contributor_id=0):
        self.name = name
        self.c_code = c_code
        self.type = self.get_contributor_type()
        self.street_no = street_no
        self.street_name = street_name
        self.apartment = apartment
        self.borough_code = borough_code
        self.city = city
        self.state = state
        self.zip_code = zip_code
        self.employer_id = employer_id
        self.employer = ''
        self.occupation_id = occupation_id
        self.occupation = ''
        self.contributor_id = contributor_id

    def get_contributor_type(self):
        if self.c_code == 'CAN':
            return 'Candidate'
        elif self.c_code == 'CORP':
            return 'Corporation'
        elif self.c_code == 'EMPO':
            return 'Labor Union'
        elif self.c_code == 'FAM':
            return 'Candidate''s Family'
        elif self.c_code == 'IND':
            return 'Individual'
        elif self.c_code == 'LLC':
            return 'Limited Liability Company'
        elif self.c_code == 'OTHR':
            return 'Other'
        elif self.c_code == 'PART':
            return 'Partnership'
        elif self.c_code == 'PCOMC':
            return 'Candidate Committee'
        elif self.c_code == 'PCOMP':
            return 'Political Action Committee'
        elif self.c_code == 'PCOMZ':
            return 'Party Committee'
        elif self.c_code == 'SPO':
            return 'Candidate\'s Spouse'
        elif self.c_code == 'UNKN':
            return 'Unknown'

    def __str__(self):
        return self.name + ' - ' + str(self.type)

    def is_self(self, other):
        if self.name.lower() == other.name.lower() and \
           self.street_no == other.street_no and \
           self.street_name.lower() == other.street_name.lower(): # and \
           # self.city.lower() == other.city.lower() and \
           # self.c_code == other.c_code and \
           # self.state.lower() == other.state.lower():
            return True
        return False

    def compare_to(self, other):
        if self.name.lower() > other.name.lower():
            return 1
        if self.name.lower() < other.name.lower():
            return -1
        if self.street_name.lower() > other.street_name.lower():
            return 1
        if self.street_name.lower() < other.street_name.lower():
            return -1
        if self.street_no > other.street_no:
            return 1
        if self.street_no < other.street_no:
            return -1
        return 0


class Employer:

    def __init__(self, name, street_no, street_name, city, state, employer_id=0):
        self.name = name
        self.street_no = street_no
        self.street_name = street_name
        self.city = city
        self.state = state
        self.employer_id = employer_id

    def __str__(self):
        return self.name

    def is_self(self, other):
        if self.name.lower() == other.name.lower() and \
           self.city.lower() == other.city.lower() and \
           self.state.lower() == other.state.lower():
           # self.street_no == other.street_no and \
           # self.street_name.lower() == other.street_name.lower() and \
            return True
        return False

    def compare_to(self, other):
        if self.name.lower() > other.name.lower():
            return 1
        if self.name.lower() < other.name.lower():
            return -1
        if self.city.lower() > other.city.lower():
            return 1
        if self.city.lower() < other.city.lower():
            return -1
        if self.state.lower() > other.state.lower():
            return 1
        if self.state.lower() < other.state.lower():
            return -1
        return 0


class Intermediary:

    def __init__(self, number, name, street_no, street_name, apartment, city, state, zip_code, occupation_id, employer_id, name_code, intermediary_id=0):
        self.number = number
        self.name = name
        self.street_no = street_no
        self.street_name = street_name
        self.apartment = apartment
        self.city = city
        self.state = state
        self.zip_code = zip_code
        self.occupation_id = occupation_id
        self.occupation = ''
        self.employer_id = employer_id
        self.employer = ''
        self.name_code = name_code
        self.intermediary_id = intermediary_id

    def __str__(self):
        return self.name + ' - ' + str(self.intermediary_id)

    def is_self(self, other):
        if self.name.lower() == other.name.lower() and \
           self.street_no == other.street_no and \
           self.street_name.lower() == other.street_name.lower(): # and \
           # self.city.lower() == other.city.lower() and \
           # self.state.lower() == other.state.lower():
            return True
        return False

    def compare_to(self, other):
        if self.name.lower() > other.name.lower():
            return 1
        if self.name.lower() < other.name.lower():
            return -1
        if self.street_name.lower() > other.street_name.lower():
            return 1
        if self.street_name.lower() < other.street_name.lower():
            return -1
        if self.street_no.lower() > other.street_no.lower():
            return 1
        if self.street_no.lower() < other.street_no.lower():
            return -1
        return 0


class Occupation:

    def __init__(self, name, occupation_id=0):
        self.name = name
        self.occupation_id = occupation_id

    def __str__(self):
        return self.name

    def is_self(self, other):
        if self.name.lower() == other.name.lower():
            return True
        return False

    def compare_to(self, other):
        if self.name.lower() > other.name.lower():
            return 1
        if self.name.lower() < other.name.lower():
            return -1
        return 0
