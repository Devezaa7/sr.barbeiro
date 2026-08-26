import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Método não permitido." }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return json({ error: "Sessão de administrador ausente." }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey =
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
  const secretKey =
    Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const siteUrl = (Deno.env.get("SITE_URL") ?? "http://localhost:8080").replace(/\/$/, "");

  if (!supabaseUrl || !publishableKey || !secretKey) {
    return json({ error: "A função não está configurada no servidor." }, 500);
  }

  // Cliente com o JWT do usuário: a RPC is_admin usa a identidade real do chamador.
  const userClient = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
  });

  const {
    data: { user: caller },
    error: callerError,
  } = await userClient.auth.getUser();

  if (callerError || !caller) {
    return json({ error: "Sessão inválida ou expirada." }, 401);
  }

  const { data: isAdmin, error: roleError } = await userClient.rpc("is_admin");
  if (roleError || !isAdmin) {
    return json({ error: "Apenas administradores podem convidar barbeiros." }, 403);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  const email = normalizeEmail(payload.email);
  const nome = normalizeText(payload.nome, 100);
  const telefone = normalizeText(payload.telefone, 20);
  const especialidades = normalizeText(payload.especialidades, 160);

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return json({ error: "Informe um e-mail válido." }, 400);
  }
  if (nome.length < 3) {
    return json({ error: "Informe o nome do barbeiro." }, 400);
  }

  const adminClient = createClient(supabaseUrl, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: invite, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/redefinir-senha`,
      data: {
        nome,
        telefone,
        papel_solicitado: "funcionario",
      },
    });

  if (inviteError || !invite.user) {
    return json({ error: inviteError?.message ?? "Não foi possível enviar o convite." }, 400);
  }

  const invitedUserId = invite.user.id;

  const { error: profileError } = await adminClient.from("profiles").upsert(
    {
      id: invitedUserId,
      nome,
      email,
      telefone: telefone || null,
      provedor: "email",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return json({ error: `Convite enviado, mas perfil não criado: ${profileError.message}` }, 500);
  }

  const { data: currentRole, error: currentRoleError } = await adminClient
    .from("user_roles")
    .select("id")
    .eq("user_id", invitedUserId)
    .eq("role", "funcionario")
    .maybeSingle();

  if (currentRoleError) {
    return json({ error: currentRoleError.message }, 500);
  }

  if (!currentRole) {
    const { error: roleInsertError } = await adminClient.from("user_roles").insert({
      user_id: invitedUserId,
      role: "funcionario",
    });

    if (roleInsertError) {
      return json({ error: roleInsertError.message }, 500);
    }
  }

  const { data: currentBarber, error: currentBarberError } = await adminClient
    .from("barbeiros")
    .select("id")
    .eq("profile_id", invitedUserId)
    .maybeSingle();

  if (currentBarberError) {
    return json({ error: currentBarberError.message }, 500);
  }

  if (currentBarber) {
    const { error: barberUpdateError } = await adminClient
      .from("barbeiros")
      .update({
        nome,
        especialidades: especialidades || null,
        ativo: true,
      })
      .eq("id", currentBarber.id);

    if (barberUpdateError) {
      return json({ error: barberUpdateError.message }, 500);
    }
  } else {
    const { error: barberInsertError } = await adminClient.from("barbeiros").insert({
      nome,
      especialidades: especialidades || null,
      profile_id: invitedUserId,
      ativo: true,
    });

    if (barberInsertError) {
      return json({ error: barberInsertError.message }, 500);
    }
  }

  return json({
    ok: true,
    userId: invitedUserId,
    message: "Convite enviado ao barbeiro.",
  });
});
