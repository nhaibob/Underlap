require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  const tables = [
    'profiles', 'tactics', 'likes', 'comments', 
    'follows', 'notifications', 'conversations', 
    'messages', 'conversation_participants'
  ];
  
  console.log('Đang kiểm tra các bảng trên Supabase...\n');
  
  for (const table of tables) {
    // Thử fetch 1 record để kiểm tra xem bảng có tồn tại không
    const { data, error } = await supabase.from(table).select('*').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log(`❌ Bảng '${table}' CHƯA tồn tại (Thiếu)`);
      } else {
        console.log(`⚠️ Bảng '${table}' có lỗi: ${error.message}`);
      }
    } else {
      console.log(`✅ Bảng '${table}' đang hoạt động tốt`);
    }
  }
}

checkTables();
