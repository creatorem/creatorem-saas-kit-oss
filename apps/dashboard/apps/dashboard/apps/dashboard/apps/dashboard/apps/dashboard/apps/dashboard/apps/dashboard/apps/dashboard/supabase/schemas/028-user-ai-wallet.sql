/*
 * ---------------------------------------------------------------------------------
 * AI Wallet Schema
 * ---------------------------------------------------------------------------------
 *
 * Purpose: Manage user AI credit wallets and track all wallet transactions
 *
 * Table of contents:
 * - AI Wallet table for storing user credit balances
 * - AI Wallet Transaction table for tracking all wallet operations
 * - Table Comments
 * - Permissions
 * - RLS Policies
 * - Triggers
 *
 * Dependencies: User table (021-user.sql)
 */

------------------------------------- AI WALLET TABLE -------------------------------------

/*
 * AI WALLET TABLE:
 * This table contains user AI credit wallet balances for pay-as-you-go usage.
 * Each user has one wallet to track their prepaid AI credits.
 */
CREATE TABLE IF NOT EXISTS "public"."ai_wallet" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null unique,
    balance numeric(10, 6) not null default 0,
    currency varchar(3) not null default 'USD',
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

-- Create index for fast user_id lookups
CREATE INDEX IF NOT EXISTS idx_ai_wallet_user_id ON public.ai_wallet(user_id);

------------------------------------- AI WALLET TRANSACTION TABLE -------------------------------------

/*
 * AI WALLET TRANSACTION TABLE:
 * This table tracks all wallet transactions including deposits, usage deductions,
 * refunds, and manual adjustments. Provides complete audit trail.
 */
CREATE TABLE IF NOT EXISTS "public"."ai_wallet_transaction" (
    id uuid unique not null default extensions.uuid_generate_v4(),
    user_id uuid references public.user (id) on delete cascade not null,
    wallet_id uuid references public.ai_wallet (id) on delete cascade not null,
    amount numeric(10, 6) not null,
    type varchar(50) not null check (type in ('deposit', 'usage', 'refund', 'adjustment')),
    description text,
    balance_after numeric(10, 6) not null,
    metadata jsonb,
    updated_at timestamptz DEFAULT "now"() NOT NULL,
    created_at timestamptz DEFAULT "now"() NOT NULL,
    primary key (id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_wallet_transaction_user_id ON public.ai_wallet_transaction(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_wallet_transaction_wallet_id ON public.ai_wallet_transaction(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ai_wallet_transaction_type ON public.ai_wallet_transaction(type);
CREATE INDEX IF NOT EXISTS idx_ai_wallet_transaction_created_at ON public.ai_wallet_transaction(created_at DESC);

------------------------------------- TABLE COMMENTS -------------------------------------

COMMENT ON TABLE "public"."ai_wallet" IS 'Stores user AI credit wallet balances for pay-as-you-go usage';
COMMENT ON COLUMN "public"."ai_wallet"."user_id" IS 'The user who owns this wallet (one wallet per user)';
COMMENT ON COLUMN "public"."ai_wallet"."balance" IS 'Current wallet balance in USD (or specified currency)';
COMMENT ON COLUMN "public"."ai_wallet"."currency" IS 'Currency code (e.g., USD, EUR)';
COMMENT ON COLUMN "public"."ai_wallet"."updated_at" IS 'Last time the wallet was updated';
COMMENT ON COLUMN "public"."ai_wallet"."created_at" IS 'When the wallet was created';

COMMENT ON TABLE "public"."ai_wallet_transaction" IS 'Tracks all wallet transactions for audit trail and history';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."user_id" IS 'The user who owns this transaction';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."wallet_id" IS 'The wallet this transaction belongs to';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."amount" IS 'Transaction amount (positive for deposits, negative for deductions)';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."type" IS 'Transaction type: deposit, usage, refund, or adjustment';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."description" IS 'Human-readable description of the transaction';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."balance_after" IS 'Wallet balance snapshot after this transaction';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."metadata" IS 'Additional data (stripe_payment_id, ai_usage_id, etc.)';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."updated_at" IS 'Last time the transaction was updated';
COMMENT ON COLUMN "public"."ai_wallet_transaction"."created_at" IS 'When the transaction was created';

------------------------------------- PERMISSIONS -------------------------------------

-- Reset the RLS access to authenticated and service_role roles
REVOKE all on public.ai_wallet from authenticated, service_role;
GRANT select, insert, update, delete on table public.ai_wallet to authenticated, service_role;

REVOKE all on public.ai_wallet_transaction from authenticated, service_role;
GRANT select, insert, update, delete on table public.ai_wallet_transaction to authenticated, service_role;

-- Enable RLS on the ai_wallet table
ALTER TABLE public.ai_wallet ENABLE ROW LEVEL SECURITY;

-- Enable RLS on the ai_wallet_transaction table
ALTER TABLE public.ai_wallet_transaction ENABLE ROW LEVEL SECURITY;

------------------------------------- RLS POLICIES -------------------------------------

/*
 * AI Wallet policy
 * Users can only access their own wallet through user_id relationship
 */
CREATE POLICY ai_wallet_all ON public.ai_wallet
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = ai_wallet.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = ai_wallet.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
);

/*
 * AI Wallet Transaction policy
 * Users can only access their own transactions through user_id relationship
 */
CREATE POLICY ai_wallet_transaction_all ON public.ai_wallet_transaction
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = ai_wallet_transaction.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.user
        WHERE ((public.user.id = ai_wallet_transaction.user_id) AND (public.user.auth_user_id = auth.uid()))
    )
);

------------------------------------- TRIGGERS -------------------------------------

/*
 * Trigger: Update timestamp on wallet changes
 * Automatically updates updated_at field when wallet is modified
 */
CREATE TRIGGER reset_updated_at_on_ai_wallet_on_update
AFTER UPDATE ON public.ai_wallet FOR EACH ROW
EXECUTE PROCEDURE kit.reset_updated_at();

/*
 * Trigger: Update timestamp on transaction changes
 * Automatically updates updated_at field when transaction is modified
 */
CREATE TRIGGER reset_updated_at_on_ai_wallet_transaction_on_update
AFTER UPDATE ON public.ai_wallet_transaction FOR EACH ROW
EXECUTE PROCEDURE kit.reset_updated_at();
