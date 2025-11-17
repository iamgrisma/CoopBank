
CREATE TABLE public.withdrawals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    member_id uuid NOT NULL,
    amount numeric(15,2) NOT NULL,
    withdrawal_date date NOT NULL,
    notes text,
    transaction_id uuid,
    CONSTRAINT withdrawals_pkey PRIMARY KEY (id),
    CONSTRAINT withdrawals_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE
);

ALTER TABLE public.withdrawals OWNER TO postgres;

GRANT ALL ON TABLE public.withdrawals TO anon;
GRANT ALL ON TABLE public.withdrawals TO authenticated;
GRANT ALL ON TABLE public.withdrawals TO postgres;
GRANT ALL ON TABLE public.withdrawals TO service_role;

