import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    console.log('Cookies received:', cookieStore.getAll().map(c => c.name));
    console.log('Redirecting to:', `${origin}${next}`);
    
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error('Supabase Auth Error:', error);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
