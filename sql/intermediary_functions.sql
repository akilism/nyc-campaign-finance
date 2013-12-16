---***************************************
--- select * from fetch_all_intermediaries();
---***************************************
CREATE OR REPLACE FUNCTION fetch_all_intermediaries()
  RETURNS TABLE(name character(200), intermediary_id int, city character(200), state character(200), occupation_id int, occupation character(500), employer_id int, employer character(500))
AS
  $$BEGIN
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
		ORDER BY
			int.state,
			int.city,
      int.name;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_all_intermediaries()
IS 'returns all the intermediaries in the database ordered by state, city, name. ';


---***************************************
--- select * from fetch_intermediary_by_id(1);
---***************************************
CREATE OR REPLACE FUNCTION fetch_intermediary_by_id(p_intermediary_id int)
  RETURNS TABLE(name character(200), intermediary_id int, city character(200), state character(200), occupation_id int, occupation character(500), employer_id int, employer character(500))
AS
  $$BEGIN
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
        int.intermediary_id = p_employer_id;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_intermediary_by_id(p_intermediary_id int)
IS 'returns the intermediary in the database matching the intermediary_id provided.';

---***************************************
--- select * from fetch_intermediary_by_name('Christopher Bennett');
---***************************************
CREATE OR REPLACE FUNCTION fetch_intermediary_by_name(p_name character(200))
  RETURNS TABLE(name character(200), intermediary_id int, city character(200), state character(200), occupation_id int, occupation character(500), employer_id int, employer character(500))
AS
  $$BEGIN
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
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_intermediary_by_name(p_name character(200))
IS 'returns the intermediary in the database matching the name provided.';

---***************************************
--- select * from fetch_intermediary_by_name_zip_occupation_id('Christopher Bennett','',131);
---***************************************
CREATE OR REPLACE FUNCTION fetch_intermediary_by_name_zip_occupation_id(p_name character(200), p_zip_code character(100), p_occupation_id int)
  RETURNS TABLE(name character(200), intermediary_id int, city character(200), state character(200), occupation_id int, occupation character(500), employer_id int, employer character(500))
AS
  $$BEGIN
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
        int.occupation_id = p_occupation_id
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_intermediary_by_name(p_name character(200), p_zip_code character(100), p_occupation_id int)
IS 'returns the intermediary in the database matching the name, zip_code and occupation_id provided.';


