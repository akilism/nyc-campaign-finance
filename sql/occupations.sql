CREATE TABLE public.occupations
(
   occupation_id serial PRIMARY KEY,
   name character(500) UNIQUE,
   search_name character(500),
   canonical_occupation_id int null
) 
WITH (
  OIDS = FALSE
)
;
COMMENT ON TABLE public.occupations
  IS 'Occupations of contributors and intermediaries.';
