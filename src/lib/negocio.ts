/**
 * Dados institucionais da barbearia.
 * Centralizados aqui para que qualquer alteração de contato ou endereço
 * aconteça em um único lugar, sem risco de divergência entre seções.
 */
export const NEGOCIO = {
  nome: "Sr. Barbeiro",
  desde: 2020,
  cidade: "Campo Grande, Rio de Janeiro",
  enderecoCompleto:
    "Estr. da Cachamorra, 272 - Loja - Campo Grande, Rio de Janeiro - RJ, 23040-150",
  enderecoResumido: "Estr. da Cachamorra, 272 - Loja - Campo Grande, RJ",
  enderecoCurto: "Estr. da Cachamorra, 272 - Loja - Campo Grande",
  cep: "23040-150",
  telefoneExibicao: "(21) 98089-1754",
  telefoneE164: "+5521980891754",
  whatsappNumero: "5521980891754",
  instagramHandle: "@srbar.beiro",
  instagramUrl: "https://www.instagram.com/srbar.beiro/",
  avaliacaoNota: "5,0",
  avaliacaoTotal: 181,
  horarioFuncionamento: [
    { dias: "Segunda a sexta", horario: "09:00 às 20:00" },
    { dias: "Sábado", horario: "09:00 às 18:00" },
    { dias: "Domingo", horario: "Fechado" },
  ],
} as const;

/** Monta o link do WhatsApp com mensagem pré-preenchida e codificada. */
export function linkWhatsApp(mensagem = `Olá, gostaria de agendar um horário na ${NEGOCIO.nome}`) {
  return `https://wa.me/${NEGOCIO.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;
}

export const MAPA_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  NEGOCIO.enderecoCompleto,
)}&output=embed`;