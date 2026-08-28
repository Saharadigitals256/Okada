// Supabase Edge Function: create-payment-request
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { rider_id, amount_ngn, settlement_amount, settlement_asset = 'USDC', passenger_name, currency = 'NGN' } = await req.json();

    if (!rider_id || !amount_ngn || !settlement_amount) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Get rider profile & wallet
    const { data: rider, error: riderError } = await supabase
      .from('profiles')
      .select('wallet_address, full_name')
      .eq('id', rider_id)
      .single();

    if (riderError || !rider) {
      return new Response(JSON.stringify({ error: 'Rider not found or wallet not configured' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Generate unique ride reference and payment ID
    const ride_reference = `OKD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const payment_id = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 3. Insert ride
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .insert({
        rider_id,
        amount_ngn,
        settlement_amount,
        settlement_asset,
        currency,
        passenger_name,
        ride_reference,
        status: 'pending',
      })
      .select()
      .single();

    if (rideError) throw rideError;

    // 4. Insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        ride_id: ride.id,
        payment_id,
        rider_wallet_address: rider.wallet_address || 'GBTESTNETOKADARIDERWALLETADDRESS123456789',
        amount: settlement_amount,
        asset: settlement_asset,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    return new Response(
      JSON.stringify({
        success: true,
        ride,
        payment,
        payment_url: `/pay/${payment_id}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
