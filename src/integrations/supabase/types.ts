export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          barbeiro_id: string
          cliente_id: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at: string
          data: string
          hora_fim: string
          hora_inicio: string
          id: string
          observacoes: string | null
          servico_id: string
          status: Database["public"]["Enums"]["agendamento_status"]
          updated_at: string
        }
        Insert: {
          barbeiro_id: string
          cliente_id?: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at?: string
          data: string
          hora_fim: string
          hora_inicio: string
          id?: string
          observacoes?: string | null
          servico_id: string
          status?: Database["public"]["Enums"]["agendamento_status"]
          updated_at?: string
        }
        Update: {
          barbeiro_id?: string
          cliente_id?: string | null
          cliente_nome?: string
          cliente_telefone?: string
          created_at?: string
          data?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          observacoes?: string | null
          servico_id?: string
          status?: Database["public"]["Enums"]["agendamento_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_barbeiro_id_fkey"
            columns: ["barbeiro_id"]
            isOneToOne: false
            referencedRelation: "barbeiros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          agendamento_id: string | null
          cliente_id: string | null
          comentario: string | null
          created_at: string
          id: string
          nome_exibicao: string | null
          nota: number
          publicada: boolean
        }
        Insert: {
          agendamento_id?: string | null
          cliente_id?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          nome_exibicao?: string | null
          nota: number
          publicada?: boolean
        }
        Update: {
          agendamento_id?: string | null
          cliente_id?: string | null
          comentario?: string | null
          created_at?: string
          id?: string
          nome_exibicao?: string | null
          nota?: number
          publicada?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      barbeiros: {
        Row: {
          ativo: boolean
          created_at: string
          especialidades: string | null
          foto_url: string | null
          id: string
          nome: string
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          especialidades?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          especialidades?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "barbeiros_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueios: {
        Row: {
          barbeiro_id: string | null
          created_at: string
          data: string
          hora_fim: string
          hora_inicio: string
          id: string
          motivo: string | null
        }
        Insert: {
          barbeiro_id?: string | null
          created_at?: string
          data: string
          hora_fim: string
          hora_inicio: string
          id?: string
          motivo?: string | null
        }
        Update: {
          barbeiro_id?: string | null
          created_at?: string
          data?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bloqueios_barbeiro_id_fkey"
            columns: ["barbeiro_id"]
            isOneToOne: false
            referencedRelation: "barbeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      horarios_disponibilidade: {
        Row: {
          barbeiro_id: string | null
          created_at: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
        }
        Insert: {
          barbeiro_id?: string | null
          created_at?: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
        }
        Update: {
          barbeiro_id?: string | null
          created_at?: string
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horarios_disponibilidade_barbeiro_id_fkey"
            columns: ["barbeiro_id"]
            isOneToOne: false
            referencedRelation: "barbeiros"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          agendamento_id: string | null
          created_at: string
          destinatario_id: string
          id: string
          lida: boolean
          mensagem: string
          tipo: Database["public"]["Enums"]["notificacao_tipo"]
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          destinatario_id: string
          id?: string
          lida?: boolean
          mensagem: string
          tipo: Database["public"]["Enums"]["notificacao_tipo"]
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          destinatario_id?: string
          id?: string
          lida?: boolean
          mensagem?: string
          tipo?: Database["public"]["Enums"]["notificacao_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          provedor: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nome?: string
          provedor?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          provedor?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          duracao_minutos: number
          id: string
          nome: string
          ordem: number
          preco: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome: string
          ordem?: number
          preco?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome?: string
          ordem?: number
          preco?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      horarios_ocupados: {
        Args: { _barbeiro_id: string; _data: string }
        Returns: {
          hora_fim: string
          hora_inicio: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_barbeiro_of: { Args: { _barbeiro_id: string }; Returns: boolean }
    }
    Enums: {
      agendamento_status:
        | "pendente"
        | "confirmado"
        | "concluido"
        | "cancelado"
        | "nao_compareceu"
      app_role: "administrador" | "funcionario" | "cliente"
      notificacao_tipo: "novo_agendamento" | "cancelamento" | "reagendamento"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agendamento_status: [
        "pendente",
        "confirmado",
        "concluido",
        "cancelado",
        "nao_compareceu",
      ],
      app_role: ["administrador", "funcionario", "cliente"],
      notificacao_tipo: ["novo_agendamento", "cancelamento", "reagendamento"],
    },
  },
} as const
