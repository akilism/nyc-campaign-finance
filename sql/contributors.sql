CREATE TABLE public.contributors
(
   contributor_id serial PRIMARY KEY,
   name character(200),
   c_code character(500),
   c_type character(500),
   street_no character(200),
   street_name character(500),
   apartment character(500),
   borough_code character(5),
   city character(500),
   state character(200),
   zip_code character(500),
   occupation_id integer REFERENCES occupations (occupation_id),
   occupation character(500),
   employer_id integer REFERENCES employers (employer_id),
   employer character(500)
   
) 
WITH (
  OIDS = FALSE
)
;
COMMENT ON TABLE public.intermediaries
  IS 'Contributors to candidates.';

