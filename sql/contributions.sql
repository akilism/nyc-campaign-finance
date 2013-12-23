CREATE TABLE public.contributions
(
  contribution_id serial PRIMARY KEY,
  schedule character(200),
  pageno character(500),
  seqno character(500),
  refno character(200),
  contribution_date date,
  refund_date date,
  amount money,
  match_amount money,
  prev_total money,
  payment_method_id integer,
  payment_method character(500),
  purpose_code_id character(100),
  purpose_code character(500),
  exempt_code_id character(500),
  adjustment_type_code_id character(500),
  is_runoff boolean,
  is_segregated boolean,
  candidate_id integer REFERENCES candidates (candidate_id),
  contributor_id integer REFERENCES contributors (contributor_id),
  intermediary_id integer REFERENCES intermediaries (intermediary_id),
  election_cycle character(500)
)
WITH (
OIDS = FALSE
)
;
COMMENT ON TABLE public.contributions
IS 'Contributions from contributors to candidates.';


COPY
contributions
(schedule, pageno, seqno, refno, contribution_date, refund_date, amount, match_amount, prev_total, payment_method_id, payment_method, purpose_code_id, purpose_code, exempt_code_id, adjustment_type_code_id, is_runoff,is_segregated, candidate_id,contributor_id, intermediary_id, election_cycle)
from
'C:\Users\akil.harris\repos\nyc_campaign_finanace\data_files\0_contributions_19_12_2013_195930.csv'
DELIMITER ','
NULL 'NULL'
CSV;