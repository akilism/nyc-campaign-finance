CREATE TABLE public.occupations
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
