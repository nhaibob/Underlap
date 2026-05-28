require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSavesTable() {
  console.log('Trying to create saves table via supabase-js...\n');

  // Try inserting into saves to see if it exists
  const { error: checkError } = await supabase
    .from('saves')
    .select('id')
    .limit(1);

  if (!checkError) {
    console.log('✅ Bảng saves đã tồn tại!');
    return;
  }

  if (checkError.code === 'PGRST204' || checkError.message.includes('does not exist') || checkError.message.includes('schema cache')) {
    console.log('❌ Bảng saves chưa tồn tại.');
    console.log('\n📋 Chạy SQL sau trong Supabase SQL Editor (https://supabase.com/dashboard):');
    console.log('------------------------------------------------------------');
    console.log(`
CREATE TABLE IF NOT EXISTS public.saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tactic_id UUID NOT NULL REFERENCES public.tactics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tactic_id)
);

CREATE INDEX IF NOT EXISTS saves_user_id_idx ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS saves_tactic_id_idx ON public.saves(tactic_id);

ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saves"
  ON public.saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also allow service role to bypass RLS
GRANT ALL ON public.saves TO service_role;
    `);
    console.log('------------------------------------------------------------');
  } else {
    console.log('Unknown error:', checkError.message);
  }
}

createSavesTable();
