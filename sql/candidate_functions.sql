---***************************************
--- select * from fetch_all_candidates();
---***************************************
CREATE OR REPLACE FUNCTION fetch_all_candidates()
  RETURNS TABLE(name character(200), cfb_id character(20), candidate_id int, office_id int, office character(200))
AS
  $$BEGIN
	RETURN QUERY
		SELECT
			c.name,
			c.cfb_id,
			c.candidate_id,
			c.office_id,
			c.office
		FROM
			candidates c
		ORDER BY
			c.office_id,
			c.name;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_all_candidates()
IS 'returns all the candidates in the database ordered by office they were running for then alphabetical by first name.';


---***************************************
--- select * from fetch_candidates_by_office_id(1);
---***************************************
CREATE OR REPLACE FUNCTION fetch_candidates_by_office_id(p_office_id int)
  RETURNS TABLE(name character(200), cfb_id character(20), candidate_id int, office_id int, office character(200))
AS
  $$BEGIN
	RETURN QUERY 
		SELECT 
			c.name, 
			c.cfb_id, 
			c.candidate_id, 
			c.office_id, 
			c.office 
		FROM 
			candidates c
		WHERE
			c.office_id = p_office_id
		ORDER BY 
			c.office_id, 
			c.name;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_candidates_by_office_id(p_office_id int)
IS 'returns all the candidates in the database for an office_id ordered by office they were running for then alphabetical by first name.';



---***************************************
--- select * from fetch_candidate_by_candidate_id(49);
---***************************************
CREATE OR REPLACE FUNCTION fetch_candidate_by_candidate_id(p_candidate_id int)
  RETURNS TABLE(name character(200), cfb_id character(20), candidate_id int, office_id int, office character(200))
AS
  $$BEGIN
	RETURN QUERY
		SELECT
			c.name,
			c.cfb_id,
			c.candidate_id,
			c.office_id,
			c.office
		FROM
			candidates c
		WHERE
			c.candidate_id = p_candidate_id;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_candidate_by_candidate_id(p_candidate_id int)
IS 'returns the candidate in the database matching the candidate_id.';


---***************************************
--- select * from fetch_candidate_offices();
---***************************************
CREATE OR REPLACE FUNCTION fetch_candidate_offices()
  RETURNS TABLE(office_id int, office character(200), count bigint)
AS
  $$BEGIN
	RETURN QUERY
  SELECT
    c.office_id,
    c.office,
    count(c.office_id) as c_count
  from
    candidates c
  group by
    c.office, c.office_id
  order by
    c.office_id DESC;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_candidate_offices()
IS 'returns the distinct candidate offices and office_ids and a count of number of candidates for that office.';


---***************************************
--- select * from fetch_candidate_by_cfb_id('326');
---***************************************
CREATE OR REPLACE FUNCTION fetch_candidate_by_cfb_id(p_cfb_id character(20))
  RETURNS TABLE(name character(200), cfb_id character(20), candidate_id int, office_id int, office character(200))
AS
  $$BEGIN
	RETURN QUERY
		SELECT
			c.name,
			c.cfb_id,
			c.candidate_id,
			c.office_id,
			c.office
		FROM
			candidates c
		WHERE
			c.cfb_id = p_cfb_id;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_candidate_by_cfb_id(p_cfb_id character(20))
IS 'returns the candidate in the database matching the candidate_id.';