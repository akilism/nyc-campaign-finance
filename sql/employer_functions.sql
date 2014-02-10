---***************************************
--- select * from fetch_all_employers();
---***************************************
-- DROP FUNCTION public.fetch_all_employers();

CREATE OR REPLACE FUNCTION public.fetch_all_employers()
  RETURNS TABLE(name character, employer_id integer, city character, state character) AS
$BODY$BEGIN
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
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_all_employers()
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_all_employers() IS 'returns all the employers in the database ordered by state, city, name. This is a massive table, think about running something else.';


---***************************************
--- select * from fetch_employer_by_id(1);
---***************************************
-- Function: public.fetch_employer_by_id(integer)

-- DROP FUNCTION public.fetch_employer_by_id(integer);

CREATE OR REPLACE FUNCTION public.fetch_employer_by_id(IN p_employer_id integer)
  RETURNS TABLE(name character, employer_id integer, city character, state character) AS
$BODY$BEGIN
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
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_employer_by_id(integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_employer_by_id(integer) IS 'returns the employer in the database matching the employer_id provided.';


---***************************************
--- select * from fetch_employer_by_name('Blackrock');
---***************************************
-- Function: public.fetch_employer_by_name(character)

-- DROP FUNCTION public.fetch_employer_by_name(character);

CREATE OR REPLACE FUNCTION public.fetch_employer_by_name(IN p_name character)
  RETURNS TABLE(name character, employer_id integer, city character, state character) AS
$BODY$BEGIN
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
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_employer_by_name(character)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_employer_by_name(character) IS 'returns the employer in the database matching the name provided.';


-- Function: public.fetch_top_n_candidates_by_employer(integer, integer)

-- DROP FUNCTION public.fetch_top_n_candidates_by_employer(integer, integer);

CREATE OR REPLACE FUNCTION public.fetch_top_n_candidates_by_employer(IN p_employer_id integer, IN p_limit integer)
  RETURNS SETOF bigint AS
$BODY$BEGIN
    RETURN QUERY

select
    count(distinct candidate_id) as count_candidates
from
    contributions con
join
    contributors ctb
on
    con.contributor_id = ctb.contributor_id
join
    employers emp
on
    ctb.employer_id = coalesce(emp.canonical_employer_id, emp.employer_id)
where
    coalesce(emp.canonical_employer_id, emp.employer_id) = 11;


  END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_top_n_candidates_by_employer(integer, integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_top_n_candidates_by_employer(integer, integer) IS 'returns top n candidates for the provided employer id.';


-- Function: public.fetch_top_n_employers_by_candidate(integer, integer)

-- DROP FUNCTION public.fetch_top_n_employers_by_candidate(integer, integer);

CREATE OR REPLACE FUNCTION public.fetch_top_n_employers_by_candidate(IN p_candidate_id integer, IN p_limit integer)
  RETURNS TABLE(employer character, employer_id integer, total_contributions numeric, total_match numeric, count_contributors bigint, total numeric) AS
$BODY$BEGIN
    RETURN QUERY

with emplrs as (
select
    COALESCE(emp.canonical_employer_id, emp.employer_id) as emp_id,
    cast(sum(con.amount) as numeric) as ttl,
    cast(sum(con.match_amount) as numeric) as ttl_match,
    count(ctb.contributor_id) as count_contributors
from
    contributions con
join
    contributors ctb
on
    con.contributor_id = ctb.contributor_id
join
    employers emp
on
    ctb.employer_id = emp.employer_id
where
    con.candidate_id = p_candidate_id
and
    con.amount > cast(0.00 as money)
group by
    emp_id
)

select
    emp.name,
    e.*,
    e.ttl + e.ttl_match as sum_ttl
from
    emplrs e
join
    employers emp
on
    e.emp_id = emp.employer_id
order by
    sum_ttl desc
limit p_limit;


  END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_top_n_employers_by_candidate(integer, integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_top_n_employers_by_candidate(integer, integer) IS 'returns top n employers for the provided candidate id.';

