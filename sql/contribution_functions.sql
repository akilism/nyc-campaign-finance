-- Function: public.fetch_contributions_by_zip()

-- DROP FUNCTION public.fetch_contributions_by_zip();

CREATE OR REPLACE FUNCTION public.fetch_contributions_by_zip()
  RETURNS TABLE(count bigint, total numeric, zip_code character, borough_code character, count_contributors integer) AS
$BODY$BEGIN
    RETURN QUERY
    --zip_code_counts
select
    count(ctb.zip_code) as count,
    cast(sum(con.amount) as numeric) as total,
    coalesce(ctb.zip_code, 'None') as zip_code,
    ctb.borough_code,
    cast(count(con.contributor_id) as int) as count_contributors
from
    contributors ctb
join
    contributions con
on
    ctb.contributor_id = con.contributor_id
where
    con.amount >= cast(0.0 as money)
group by
    ctb.zip_code, ctb.borough_code
order by
    borough_code, total desc;

END;$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.fetch_contributions_by_zip()
  OWNER TO akil;
COMMENT ON FUNCTION public.fetch_contributions_by_zip() IS 'returns the distinct zip_codes, their total contributions and number of contributions';
