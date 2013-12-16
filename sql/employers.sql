CREATE TABLE public.employers
(
   employer_id serial PRIMARY KEY,
   name character(200) UNIQUE,
   street_no character(200),
   street_name character(500),
   city character(500),
   state character(200)
) 
WITH (
  OIDS = FALSE
)
;
COMMENT ON TABLE public.employers
  IS 'Employers of contributors and intermediaries.';
