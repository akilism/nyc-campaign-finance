CREATE TABLE public.candidates
(
   candidate_id serial PRIMARY KEY,
   office_id integer NOT NULL, 
   office character(100), 
   cfb_id character(20) UNIQUE, 
   canclass character(150), 
   committee character(200), 
   filing character(200),
   name character(200) UNIQUE
) 
WITH (
  OIDS = FALSE
)
;
COMMENT ON COLUMN public.candidates.cfb_id IS 'Campaign Finance Board ID';
COMMENT ON COLUMN public.candidates.canclass IS 'candidate class';
COMMENT ON TABLE public.candidates
  IS 'New York City Candidates for Public Office.';


COPY
candidates
(office_id, office, cfb_id, canclass, committee, filing, name)
from
'C:\Users\akil.harris\repos\nyc_campaign_finanace\data_files\0_candidates_19_12_2013_220735.csv'
DELIMITER ','
NULL 'NULL'
CSV;