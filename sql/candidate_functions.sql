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
-- drop function fetch_candidates_by_office_id(p_office_id int)
--- select * from fetch_candidates_by_office_id(1);
---***************************************
CREATE OR REPLACE FUNCTION fetch_candidates_by_office_id(p_office_id int)
  RETURNS TABLE(name character(200), cfb_id character(20), candidate_id int, office_id int, office character(200), candidate_contributions numeric, candidate_debits numeric, office_contributions numeric, office_debits numeric, count_candidates int)
AS
  $$BEGIN
    RETURN QUERY
    SELECT
      c.name,
      c.cfb_id,
      c.candidate_id,
      c.office_id,
      c.office,
      cast(c.total_contributions as numeric) as can_con,
      cast(c.total_debits as numeric) as can_debt,
      cast(o.total_contributions as numeric) as off_con,
      cast(o.total_debits as numeric) as off_debt,
      o.count_candidates
    FROM
      candidates c
      join
      offices o
        on
          c.office_id = o.office_id
    WHERE
      c.office_id = p_office_id
      and
      c.total_contributions > cast(0.00 as money)
    ORDER BY
      can_con desc,
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
--select * from fetch_candidate_offices();
--drop function fetch_candidate_offices();
---***************************************

CREATE OR REPLACE FUNCTION fetch_candidate_offices()
  RETURNS TABLE(office_id int, office character(200), count bigint, total numeric)
AS
  $$BEGIN
	RETURN QUERY
  --Select all the office id's and names count the number of occurrences.
SELECT
    c.office_id,
    c.office,
    count(c.office_id) as c_count,
    cast((select sum(amount) from contributions con join candidates can on con.candidate_id = can.candidate_id where can.office_id = c.office_id and con.amount > cast(0.0 as money)) as numeric) as total
FROM
    candidates c
GROUP BY
    c.office, c.office_id
ORDER BY
    total desc;

END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_candidate_offices()
IS 'returns the distinct candidate offices and office_ids, a count of number of candidates, and the total amount of contributions for all candidates.';

---***************************************
--- select * from fetch_candidate_by_cfb_id('326');
---***************************************
CREATE OR REPLACE FUNCTION fetch_candidate_by_cfb_id(p_cfb_id character(20))
  RETURNS TABLE(name character(200), cfb_id character(20), candidate_id int, office_id int, office character(200), total numeric)
AS
  $$BEGIN
	RETURN QUERY
  SELECT
    c.name,
    c.cfb_id,
    c.candidate_id,
    c.office_id,
    c.office,
    cast(sum(con.amount) as numeric) as total
  FROM
    candidates c
    join
    contributions con
      on
        con.candidate_id = c.candidate_id
  WHERE
    c.cfb_id = p_cfb_id
  group by
    c.name, c.cfb_id, c.candidate_id, c.office_id, c.office
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_candidate_by_cfb_id(p_cfb_id character(20))
IS 'returns the candidate in the database matching the candidate_id.';

CREATE OR REPLACE FUNCTION fetch_candidate_monthly_contributions_by_candidate_id(p_candidate_id int)
  RETURNS TABLE(contribution_date timestamp with time zone, total numeric, candidate_id integer)
AS
  $$BEGIN
	RETURN QUERY
select
	date_trunc('month', con.contribution_date) as "MONTH",
	cast(sum(con.amount) as numeric) as total,
	con.candidate_id
from
	contributions con
where
	con.contribution_date > now() - interval '99 years'
and
	con.candidate_id = p_candidate_id
and
	con.amount > cast(0.00 as money)
group by
	"MONTH", con.candidate_id
order by
	"MONTH";
END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_candidate_monthly_contributions_by_candidate_id(p_candidate_id int)
IS 'returns the monthy breakdown of contributions for the candidate id provided.';

CREATE OR REPLACE FUNCTION fetch_top_n_contributors_for_candidate(IN p_candidate_id integer, IN p_limit integer)
  RETURNS TABLE(name character, contributor_id integer, total numeric) AS
$BODY$BEGIN
	RETURN QUERY 
		select
			ctr.name,
			ctr.contributor_id,
			cast(sum(con.amount) as numeric) as total
		from
			contributions con
		join
			contributors ctr
		on
			con.contributor_id = ctr.contributor_id
		where
			con.candidate_id = p_candidate_id and con.amount > cast(0.00 as money)
		group by
			ctr.contributor_id, ctr.name
		order by
			total desc
		limit p_limit;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION fetch_top_n_contributors_for_candidate(integer, integer)
  OWNER TO akil;
COMMENT ON FUNCTION fetch_top_n_contributors_for_candidate(integer, integer) IS 'returns the top N contributors to the provided candidate_id.';


CREATE OR REPLACE FUNCTION fetch_candidate_details(p_candidate_id int)
  RETURNS TABLE(candidate_id int, office character, name character, total_contributions numeric, total_debits numeric)
AS
  $$BEGIN
    RETURN QUERY
	select 
		c.candidate_id,
		c.office,
		c.name,
		cast(c.total_contributions as numeric) as ttl_contrib,
		cast(c.total_debits as numeric) as ttl_debit
	from 
		candidates c
	where 
		c.candidate_id = p_candidate_id;
  END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_candidate_details(p_candidate_id int)
IS 'returns candiadte details.';

CREATE OR REPLACE FUNCTION fetch_top_n_occupations_by_candidate(p_candidate_id int, p_limit int)
  RETURNS TABLE(occupation character, occupation_id int, total_contributions numeric, count bigint)
AS
  $$BEGIN
    RETURN QUERY
select
	ctr.occupation,
	ctr.occupation_id,
	cast(sum(con.amount) as numeric) as ttl,
	count(con.contributor_id) as cnt
from
	contributions con
join
	contributors ctr
on
	con.contributor_id = ctr.contributor_id
where
	con.candidate_id = p_candidate_id and con.amount > cast(0.00 as money)
group by
	ctr.occupation_id, ctr.occupation
order by
	ttl desc
limit 
	p_limit;
  END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_top_n_occupations_by_candidate(int, int)
IS 'returns top n occupations for the provided candidate id.';