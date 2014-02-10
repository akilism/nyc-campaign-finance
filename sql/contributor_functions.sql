-- Function: public.fetch_contributor_by_name_zip_c_code_occupation(character, character, character, integer)

-- DROP FUNCTION public.fetch_contributor_by_name_zip_c_code_occupation(character, character, character, integer);

CREATE OR REPLACE FUNCTION public.fetch_contributor_by_name_zip_c_code_occupation(IN p_name character, IN p_c_code character, IN p_zip_code character, IN p_occupation_id integer)
  RETURNS TABLE(name character, contributor_id integer, c_code character, c_type character, borough_code character, city character, state character, occupation_id integer, occupation character, employer_id integer, employer character) AS
$BODY$BEGIN
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
      con.occupation_id = p_occupation_id
      and
      con.c_code = p_c_code;
  END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_contributor_by_name_zip_c_code_occupation(character, character, character, integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_contributor_by_name_zip_c_code_occupation(character, character, character, integer) IS 'returns the contributor in the database matching the name, zip, occupation_id and c_code provided.';