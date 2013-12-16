---***************************************
--- select * from fetch_all_employers();
---***************************************
CREATE OR REPLACE FUNCTION fetch_all_employers()
  RETURNS TABLE(name character(200), employer_id int, city character(200), state character(200))
AS
  $$BEGIN
	RETURN QUERY
		SELECT
      emp.name,
      emp.employer_id,
      emp.city,
      emp.state
		FROM
			employers emp
		ORDER BY
			emp.state,
			emp.city,
      emp.name;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_all_employers()
IS 'returns all the employers in the database ordered by state, city, name. This is a massive table, think about running something else.';


---***************************************
--- select * from fetch_employer_by_id(1);
---***************************************
CREATE OR REPLACE FUNCTION fetch_employer_by_id(p_employer_id int)
  RETURNS TABLE(name character(200), employer_id int, city character(200), state character(200))
AS
  $$BEGIN
	RETURN QUERY
    SELECT
      emp.name,
      emp.employer_id,
      emp.city,
      emp.state
    FROM
      employers emp
    WHERE
        emp.employer_id = p_employer_id;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_employer_by_id(p_employer_id int)
IS 'returns the employer in the database matching the employer_id provided.';

---***************************************
--- select * from fetch_employer_by_name('Blackrock');
---***************************************
CREATE OR REPLACE FUNCTION fetch_employer_by_name(p_name character(200))
  RETURNS TABLE(name character(200), employer_id int, city character(200), state character(200))
AS
  $$BEGIN
	RETURN QUERY
    SELECT
      emp.name,
      emp.employer_id,
      emp.city,
      emp.state
    FROM
      employers emp
    WHERE
        emp.name = p_name;
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_employer_by_name(p_name character(200))
IS 'returns the employer in the database matching the name provided.';




