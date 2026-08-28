-- ==============================================================================
-- OKADA: Fast Payments for Every Ride (Stellar & Soroban Payment Platform)
-- Database Schema & Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    wallet_address TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('rider', 'passenger')),
    currency_preference TEXT DEFAULT 'NGN',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Rides Table
CREATE TABLE IF NOT EXISTS public.rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    passenger_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount_ngn NUMERIC(12, 2) NOT NULL CHECK (amount_ngn > 0),
    settlement_amount NUMERIC(18, 7) NOT NULL CHECK (settlement_amount > 0),
    settlement_asset TEXT NOT NULL DEFAULT 'USDC',
    currency TEXT NOT NULL DEFAULT 'NGN',
    pickup_location TEXT,
    destination TEXT,
    passenger_name TEXT,
    ride_reference TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    payment_id TEXT NOT NULL UNIQUE,
    rider_wallet_address TEXT NOT NULL,
    passenger_wallet_address TEXT,
    amount NUMERIC(18, 7) NOT NULL CHECK (amount > 0),
    asset TEXT NOT NULL DEFAULT 'USDC',
    stellar_transaction_hash TEXT,
    soroban_transaction_hash TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indices for rapid lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON public.profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_rides_rider_id ON public.rides(rider_id);
CREATE INDEX IF NOT EXISTS idx_rides_reference ON public.rides(ride_reference);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON public.payments(ride_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile upon signup"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Public profile read for rider name lookup when passenger scans QR
CREATE POLICY "Allow public read of basic rider info for QR payment"
    ON public.profiles FOR SELECT
    USING (user_type = 'rider');

-- Rides Policies
CREATE POLICY "Riders can view all their rides"
    ON public.rides FOR SELECT
    USING (auth.uid() = rider_id);

CREATE POLICY "Riders can create rides"
    ON public.rides FOR INSERT
    WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Riders can update their rides"
    ON public.rides FOR UPDATE
    USING (auth.uid() = rider_id);

CREATE POLICY "Passengers can view their associated rides"
    ON public.rides FOR SELECT
    USING (auth.uid() = passenger_id);

-- Payments Policies
CREATE POLICY "Riders can view their payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.rides
            WHERE public.rides.id = public.payments.ride_id
            AND public.rides.rider_id = auth.uid()
        )
    );

CREATE POLICY "Public read for payment page by payment_id"
    ON public.payments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create payments"
    ON public.payments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Update payment status upon settlement"
    ON public.payments FOR UPDATE
    USING (true);

-- Functions & Triggers for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_rides_modtime
    BEFORE UPDATE ON public.rides
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
