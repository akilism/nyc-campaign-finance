-- Function: public.fetch_all_occupations()

-- DROP FUNCTION public.fetch_all_occupations();

CREATE OR REPLACE FUNCTION public.fetch_all_occupations()
  RETURNS TABLE(name character, occupation_id integer) AS
$BODY$BEGIN
    RETURN QUERY
        SELECT
      occ.name,
      occ.occupation_id
        FROM
            occupations occ
        ORDER BY
      occ.name;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_all_occupations()
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_all_occupations() IS 'returns all the occupations in the database ordered name.';
-- Function: public.fetch_occupation_by_id(integer)

-- DROP FUNCTION public.fetch_occupation_by_id(integer);

CREATE OR REPLACE FUNCTION public.fetch_occupation_by_id(IN p_occupation_id integer)
  RETURNS TABLE(name character, occupation_id integer) AS
$BODY$BEGIN
    RETURN QUERY
  SELECT
    occ.name,
    occ.occupation_id
  FROM
    occupations occ
  WHERE
    occ.occupation_id = p_occupation_id;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_occupation_by_id(integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_occupation_by_id(integer) IS 'returns the occupation in the database matching the occupation_id provided.';

-- Function: public.fetch_occupation_by_name(character)

-- DROP FUNCTION public.fetch_occupation_by_name(character);

CREATE OR REPLACE FUNCTION public.fetch_occupation_by_name(IN p_name character)
  RETURNS TABLE(name character, occupation_id integer) AS
$BODY$BEGIN
    RETURN QUERY
  SELECT
    occ.name,
    occ.occupation_id
  FROM
    occupations occ
  WHERE
    occ.name = p_name;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_occupation_by_name(character)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_occupation_by_name(character) IS 'returns the occupation in the database matching the name provided.';
