import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

/** Link de confirmação de e-mail do Supabase: troca o código por uma sessão. */
export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("code");
  if (codigo) {
    const supabase = await criarClienteServidor();
    await supabase.auth.exchangeCodeForSession(codigo);
  }
  return NextResponse.redirect(new URL("/criar", request.url));
}
