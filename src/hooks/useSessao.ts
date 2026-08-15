import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Papel = "administrador" | "funcionario" | "cliente";

export interface EstadoSessao {
  readonly carregando: boolean;
  readonly session: Session | null;
  readonly user: User | null;
  readonly papeis: readonly Papel[];
}

/**
 * Lê a sessão atual e os papéis do usuário.
 *
 * O listener é registrado antes do getSession() para não perder o evento
 * inicial, e a busca de papéis é adiada para fora do callback (recomendação
 * do Supabase: não executar chamadas assíncronas dentro do handler).
 */
export function useSessao(): EstadoSessao {
  const [session, setSession] = useState<Session | null>(null);
  const [papeis, setPapeis] = useState<readonly Papel[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      if (!ativo) return;
      setSession(novaSessao);
      setCarregando(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!ativo) return;
      setSession(data.session);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) {
      setPapeis([]);
      return;
    }
    let ativo = true;
    void supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .then(({ data }) => {
        if (!ativo) return;
        setPapeis((data ?? []).map((linha) => linha.role as Papel));
      });
    return () => {
      ativo = false;
    };
  }, [userId]);

  return { carregando, session, user: session?.user ?? null, papeis };
}

export function temPapel(papeis: readonly Papel[], papel: Papel): boolean {
  return papeis.includes(papel);
}