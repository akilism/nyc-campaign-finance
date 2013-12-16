CREATE TABLE public.intermediaries
(
   intermediary_id serial PRIMARY KEY,
   name character(200),
   street_no character(200),
   street_name character(500),
   apartment character(500),
   city character(500),
   state character(200),
   zip_code character(500),
   occupation_id integer REFERENCES occupations (occupation_id),
   occupation character(500),
   employer_id integer REFERENCES employers (employer_id),
   employer character(500),
   name_code character(500)
) 
WITH (
  OIDS = FALSE
)
;
COMMENT ON TABLE public.intermediaries
  IS 'Intermediaries of contributors and candidates.';
