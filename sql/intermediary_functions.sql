-- Function: public.fetch_intermediary_by_id(integer)

-- DROP FUNCTION public.fetch_intermediary_by_id(integer);

CREATE OR REPLACE FUNCTION public.fetch_intermediary_by_id(IN p_intermediary_id integer)
  RETURNS TABLE(name character, intermediary_id integer, city character, state character, occupation_id integer, occupation character, employer_id integer, employer character) AS
$BODY$BEGIN
    RETURN QUERY
    SELECT
      int.name,
      int.intermediary_id,
      int.city,
      int.state,
      int.occupation_id,
      int.occupation,
      int.employer_id,
      int.employer
    FROM
      intermediaries int
    WHERE
        int.intermediary_id = p_intermediary_id;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_intermediary_by_id(integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_intermediary_by_id(integer) IS 'returns the intermediary in the database matching the intermediary_id provided.';

-- Function: public.fetch_intermediary_by_name(character)

-- DROP FUNCTION public.fetch_intermediary_by_name(character);

CREATE OR REPLACE FUNCTION public.fetch_intermediary_by_name(IN p_name character)
  RETURNS TABLE(name character, intermediary_id integer, city character, state character, occupation_id integer, occupation character, employer_id integer, employer character) AS
$BODY$BEGIN
    RETURN QUERY
    SELECT
      int.name,
      int.intermediary_id,
      int.city,
      int.state,
      int.occupation_id,
      int.occupation,
      int.employer_id,
      int.employer
    FROM
      intermediaries int
    WHERE
        int.name = p_name;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_intermediary_by_name(character)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_intermediary_by_name(character) IS 'returns the intermediary in the database matching the name provided.';

-- Function: public.fetch_intermediary_by_name_zip_occupation_id(character, character, integer)

-- DROP FUNCTION public.fetch_intermediary_by_name_zip_occupation_id(character, character, integer);

CREATE OR REPLACE FUNCTION public.fetch_intermediary_by_name_zip_occupation_id(IN p_name character, IN p_zip_code character, IN p_occupation_id integer)
  RETURNS TABLE(name character, intermediary_id integer, city character, state character, occupation_id integer, occupation character, employer_id integer, employer character) AS
$BODY$BEGIN
    RETURN QUERY
    SELECT
      int.name,
      int.intermediary_id,
      int.city,
      int.state,
      int.occupation_id,
      int.occupation,
      int.employer_id,
      int.employer
    FROM
      intermediaries int
    WHERE
        int.name = p_name
    AND
        int.zip_code = p_zip_code
    AND
        int.occupation_id = p_occupation_id;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_intermediary_by_name_zip_occupation_id(character, character, integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_intermediary_by_name_zip_occupation_id(character, character, integer) IS 'returns the intermediary in the database matching the name, zip_code and occupation_id provided.';