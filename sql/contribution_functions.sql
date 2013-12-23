
CREATE OR REPLACE FUNCTION fetch_contributions_by_zip()
  RETURNS TABLE(count bigint, total numeric, zip_code bpchar)
AS
  $$BEGIN
	RETURN QUERY
	--zip_code_counts
select
	count(ctb.zip_code) as count,
	cast(sum(con.amount) as numeric) as total,
	coalesce(ctb.zip_code, 'None') as zip_code
from
	contributors ctb
join
	contributions con
on
	ctb.contributor_id = con.contributor_id
where
	con.amount > cast(0.0 as money)
group by
	ctb.zip_code
order by
	total desc;

END;$$
LANGUAGE plpgsql;
COMMENT ON FUNCTION public.fetch_contributions_by_zip()
IS 'returns the distinct zip_codes, their total contributions and number of contributions';
