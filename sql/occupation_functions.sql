---***************************************
--- select * from fetch_all_occupations();
---***************************************
CREATE OR REPLACE FUNCTION fetch_all_occupations()
  RETURNS TABLE(name character(200), occupation_id int)
AS
  $$BEGIN
	RETURN QUERY
		SELECT
      occ.name,
      occ.occupation_id
		FROM
			occupations occ
		ORDER BY
      occ.name;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_all_occupations()
IS 'returns all the occupations in the database ordered name.';


---***************************************
--- select * from fetch_occupation_by_id(1);
---***************************************
CREATE OR REPLACE FUNCTION fetch_occupation_by_id(p_occupation_id int)
  RETURNS TABLE(name character(200), occupation_id int)
AS
  $$BEGIN
	RETURN QUERY
  SELECT
    occ.name,
    occ.occupation_id
  FROM
    occupations occ
  WHERE
    occ.occupation_id = p_occupation_id;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_occupation_by_id(p_employer_id int)
IS 'returns the occupation in the database matching the occupation_id provided.';


---***************************************
--- select * from fetch_occupation_by_name('A&R');
---***************************************
CREATE OR REPLACE FUNCTION fetch_occupation_by_name(p_name character(200))
  RETURNS TABLE(name character(200), occupation_id int)
AS
  $$BEGIN
	RETURN QUERY
  SELECT
    occ.name,
    occ.occupation_id
  FROM
    occupations occ
  WHERE
    occ.p_name = p_name;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_occupation_by_name(p_name character(200))
IS 'returns the occupation in the database matching the name provided.';



---***************************************
--- select set_occupation_canonical_id('{2879, 2578,11443,29820,616,11964}', 616);
---***************************************
CREATE OR REPLACE FUNCTION set_occupation_canonical_id(p_occupation_ids integer[], p_canonical_id integer)
  RETURNS integer AS
  $BODY$BEGIN

  create temp table arr as select unnest(p_occupation_ids) id;

  UPDATE
    occupations occ
  SET
    canonical_occupation_id = p_canonical_id
  WHERE
    occ.occupation_id in (select id from arr);

  drop table arr;
  return p_canonical_id;
END;$BODY$
LANGUAGE plpgsql;
COMMENT ON FUNCTION set_occupation_canonical_id(integer[], integer) IS 'updates a csv of occupation_ids with a canonical_occupation_id to deal with discrepancies in the data.';

