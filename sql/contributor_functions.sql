
---***************************************
--- select * from fetch_contributor_by_name_zip_c_code_occupation('Christopher Bennett');
---***************************************
CREATE OR REPLACE FUNCTION fetch_contributor_by_name_zip_c_code_occupation(p_name character(200), p_c_code character(500),
                                                                           p_zip_code character(200), p_occupation_id int)
  RETURNS TABLE(name character(200), contributor_id int, c_code character(500), c_type character(500), borough_code character(5), city character(200), state character(200), occupation_id int, occupation character(500), employer_id int, employer character(500))
AS
  $$BEGIN
    RETURN QUERY
    SELECT
      con.name,
      con.contributor_id,
      con.c_code,
      con.c_type,
      con.borough_code,
      con.city,
      con.state,
      con.occupation_id,
      con.occupation,
      con.employer_id,
      con.employer
    FROM
      contributors con
    WHERE
      con.name = p_name
      and
      con.zip_code = p_zip_code
      and
      --con.occupation_id = p_occupation_id
      CASE p_occupation_id
        WHEN IS NULL THEN
          con.occupation_id is NULL
        ELSE
          con.occupation_id = p_occupation_id
      and
      con.c_code = p_c_code;
  END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_contributor_by_name_zip_c_code_occupation(p_name character(200), p_c_code character(500),
                                                                           p_zip_code character(200), p_occupation_id int)
IS 'returns the contributor in the database matching the name, zip, occupation_id and c_code provided.';