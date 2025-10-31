window.IMNGUY_APP_CONFIG = window.IMNGUY_APP_CONFIG || {
  /**
   * Cấu hình Supabase để đồng bộ hóa dữ liệu tài khoản và danh thiếp.
   *
   * Tạo một dự án Supabase mới và điền URL + anon key vào hai trường dưới đây.
   * Các bảng gợi ý:
   *  - card_users (cột chính: username (text, primary key), email (text), password (text), created_at (timestamptz))
   *  - cards (cột chính: id (uuid, primary key), username (text), data (jsonb), updated_at (timestamptz))
   *  - shared_cards (cột chính: id (uuid, primary key), username (text), data (jsonb), card_id (uuid), created_at (timestamptz), expires_at (timestamptz))
   */
  supabaseUrl: '',
  supabaseAnonKey: '',
  tables: {
    users: 'card_users',
    cards: 'cards',
    shared: 'shared_cards',
  },
  share: {
    expirationHours: 72,
  },
};
