import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmbwqrtydvoqavmboukf.supabase.co'
const supabaseAnonKey = 'sb_publishable_sfWG6I1Vs1lM-q_8zfLelA_xaargN-b'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
