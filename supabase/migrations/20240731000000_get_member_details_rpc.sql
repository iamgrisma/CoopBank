-- supabase/migrations/20240731000000_get_member_details_rpc.sql

create or replace function get_member_details(member_id_param uuid)
returns json
language plpgsql
as $$
declare
    member_details json;
    shares_details json;
    savings_details json;
    loans_details json;
    transactions_details json;
    repayments_details json;
    all_loan_schemes json;
    all_saving_schemes json;
    loan_ids uuid[];
begin
    -- Get member data
    select to_json(m) into member_details
    from members m where m.id = member_id_param;

    -- Get shares data
    select coalesce(json_agg(s), '[]'::json) into shares_details
    from shares s where s.member_id = member_id_param;

    -- Get savings data
    select coalesce(json_agg(s), '[]'::json) into savings_details
    from (
        select s.*, row_to_json(ss) as saving_schemes
        from savings s
        join saving_schemes ss on s.saving_scheme_id = ss.id
        where s.member_id = member_id_param
        order by s.deposit_date desc
    ) s;

    -- Get loans data and their IDs
    select coalesce(json_agg(l), '[]'::json), array_agg(l.id) into loans_details, loan_ids
    from (
        select l.*, row_to_json(ls) as loan_schemes, row_to_json(m) as members
        from loans l
        join loan_schemes ls on l.loan_scheme_id = ls.id
        join members m on l.member_id = m.id
        where l.member_id = member_id_param
        order by l.disbursement_date desc
    ) l;

    -- Get repayments for the member's loans
    select coalesce(json_agg(lr), '[]'::json) into repayments_details
    from loan_repayments lr
    where lr.loan_id = any(loan_ids);
    
    -- Get transactions data
    select coalesce(json_agg(t), '[]'::json) into transactions_details
    from transactions t where t.member_id = member_id_param
    order by t.date asc;

    -- Get all schemes for the forms
    select coalesce(json_agg(ls), '[]'::json) into all_loan_schemes
    from loan_schemes ls order by ls.name asc;

    select coalesce(json_agg(ss), '[]'::json) into all_saving_schemes
    from saving_schemes ss order by ss.name asc;
    
    -- Combine all data into a single JSON object
    return json_build_object(
        'member_data', member_details,
        'shares_data', shares_details,
        'savings_data', savings_details,
        'loans_data', loans_details,
        'transactions_data', transactions_details,
        'repayments_data', repayments_details,
        'loan_schemes_data', all_loan_schemes,
        'saving_schemes_data', all_saving_schemes
    );
end;
$$;
