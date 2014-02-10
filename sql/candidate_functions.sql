---***************************************
--- select * from fetch_all_candidates();
---***************************************
-- Function: public.fetch_all_candidates()

-- DROP FUNCTION public.fetch_all_candidates();

CREATE OR REPLACE FUNCTION public.fetch_all_candidates()
  RETURNS TABLE(name character, cfb_id character, candidate_id integer, office_id integer, office character) AS
$BODY$BEGIN
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
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_all_candidates()
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_all_candidates() IS 'returns all the candidates in the database ordered by office they were running for then alphabetical by first name.';

-- Function: public.fetch_candidate_by_candidate_id(integer)

-- DROP FUNCTION public.fetch_candidate_by_candidate_id(integer);

CREATE OR REPLACE FUNCTION public.fetch_candidate_by_candidate_id(IN p_candidate_id integer)
  RETURNS TABLE(name character, cfb_id character, candidate_id integer, office_id integer, office character) AS
$BODY$BEGIN
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
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_candidate_by_candidate_id(integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_candidate_by_candidate_id(integer) IS 'returns the candidate in the database matching the candidate_id.';

-- Function: public.fetch_candidate_by_cfb_id(character)

-- DROP FUNCTION public.fetch_candidate_by_cfb_id(character);

CREATE OR REPLACE FUNCTION public.fetch_candidate_by_cfb_id(IN p_cfb_id character)
  RETURNS TABLE(name character, cfb_id character, candidate_id integer, office_id integer, office character, total numeric, match_total numeric, count_contributors integer) AS
$BODY$BEGIN
    RETURN QUERY
  SELECT
    c.name,
    c.cfb_id,
    c.candidate_id,
    c.office_id,
    c.office,
    coalesce(cast(sum(con.amount) as numeric), 0) as total,
    coalesce(cast(sum(con.match_amount) as numeric), 0) as match_total,
    c.count_contributors
  FROM
    candidates c
    left join
    contributions con
      on
        con.candidate_id = c.candidate_id
  WHERE
    c.cfb_id = p_cfb_id
  group by
    c.name, c.cfb_id, c.candidate_id, c.office_id, c.office, c.count_contributors;
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_candidate_by_cfb_id(character)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_candidate_by_cfb_id(character) IS 'returns the candidate in the database matching the candidate_id.';

-- Function: public.fetch_candidate_details(integer)

-- DROP FUNCTION public.fetch_candidate_details(integer);

CREATE OR REPLACE FUNCTION public.fetch_candidate_details(IN p_candidate_id integer)
  RETURNS TABLE(candidate_id integer, office character, name character, total_contributions numeric, total_debits numeric, total_match numeric, total numeric, count_contributors integer) AS
$BODY$BEGIN
    RETURN QUERY
    select
        c.candidate_id,
        c.office,
        c.name,
        cast(c.total_contributions as numeric) as ttl_contrib,
        cast(c.total_debits as numeric) as ttl_debit,
        cast(c.total_match as numeric) as ttl_match,
        cast(c.total_contributions + coalesce(c.total_match, cast(0.00 as money)) as numeric) as ttl,
        c.count_contributors
    from
        candidates c
    where
        c.candidate_id = p_candidate_id;
  END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_candidate_details(integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_candidate_details(integer) IS 'returns candiadte details.';

-- Function: public.fetch_candidate_monthly_contributions_by_candidate_id(integer)

-- DROP FUNCTION public.fetch_candidate_monthly_contributions_by_candidate_id(integer);

CREATE OR REPLACE FUNCTION public.fetch_candidate_monthly_contributions_by_candidate_id(IN p_candidate_id integer)
  RETURNS TABLE(contribution_date timestamp with time zone, total_contributions numeric, total_match numeric, total numeric, count_countributor bigint, candidate_id integer) AS
$BODY$BEGIN
    RETURN QUERY
select
    date_trunc('month', con.contribution_date) as "MONTH",
    cast(sum(con.amount) as numeric) as total_contributions,
    cast(sum(con.match_amount) as numeric) as total_match,
    cast(sum(con.amount) as numeric) + coalesce(cast(sum(con.match_amount) as numeric), 0.00) as total,
    count(contributor_id) as count_contributor,
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
END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_candidate_monthly_contributions_by_candidate_id(integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_candidate_monthly_contributions_by_candidate_id(integer) IS 'returns the monthy breakdown of contributions for the candidate id provided.';

-- Function: public.fetch_top_n_contributors_for_candidate(integer, integer)

-- DROP FUNCTION public.fetch_top_n_contributors_for_candidate(integer, integer);

CREATE OR REPLACE FUNCTION public.fetch_top_n_contributors_for_candidate(IN p_candidate_id integer, IN p_limit integer)
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
ALTER FUNCTION public.fetch_top_n_contributors_for_candidate(integer, integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_top_n_contributors_for_candidate(integer, integer) IS 'returns the top N contributors to the provided candidate_id.';

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

-- Function: public.fetch_top_n_occupations_by_candidate(integer, integer)

-- DROP FUNCTION public.fetch_top_n_occupations_by_candidate(integer, integer);

CREATE OR REPLACE FUNCTION public.fetch_top_n_occupations_by_candidate(IN p_candidate_id integer, IN p_limit integer)
  RETURNS TABLE(occupation character, occupation_id integer, total_contributions numeric, count bigint) AS
$BODY$BEGIN
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
  END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_top_n_occupations_by_candidate(integer, integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_top_n_occupations_by_candidate(integer, integer) IS 'returns top n occupations for the provided candidate id.';

-- Function: public.fetch_top_n_zip_codes_for_candidate(integer, integer)

-- DROP FUNCTION public.fetch_top_n_zip_codes_for_candidate(integer, integer);

CREATE OR REPLACE FUNCTION public.fetch_top_n_zip_codes_for_candidate(IN p_candidate_id integer, IN p_limit integer)
  RETURNS SETOF json AS
$BODY$BEGIN
return query
                with zip as (
        select
            ctb.zip_code,
            sum(con.amount) as total
        from
            candidates c
        join
            contributions con
        on
            c.candidate_id = con.candidate_id
        join
            contributors ctb
        on
            con.contributor_id = ctb.contributor_id
        where
            c.candidate_id = p_candidate_id and con.amount > cast(0.00 as money) and ctb.zip_code != ''
        group by
            ctb.zip_code
        order by
            total desc
        limit p_limit
)

select json_agg(zips) from (select
    trim(both from z.zip_code) as zip_code,
    cast(zt.total as numeric),
    geojson,
    trim(both from po_name) as po_name,
    trim(both from borough) as borough,
    trim(both from state) as state
from
    zip zt
join
    zip_codes z
on
    zt.zip_code = z.zip_code
) zips;

END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_top_n_zip_codes_for_candidate(integer, integer)
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_top_n_zip_codes_for_candidate(integer, integer) IS 'returns city zip code data for all zips with .';