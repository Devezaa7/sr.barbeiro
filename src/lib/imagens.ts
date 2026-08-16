/**
 * Registro central das imagens do site.
 *
 * Para trocar por fotos reais da barbearia no futuro: substitua o arquivo em
 * src/assets mantendo o mesmo nome (ou aponte o import para o novo arquivo) e
 * ajuste `largura`/`altura` para as dimensões reais. Nenhuma seção precisa ser
 * reescrita — todas consomem estas variáveis.
 *
 * Direção visual obrigatória para qualquer substituição:
 * ambiente escuro, luz pontual quente (âmbar), contraste alto, sem fotos claras
 * ou "estouradas", enquadramento fechado em detalhes do ofício.
 */
import galeriaAmbienteArquivo from "@/assets/galeria-ambiente.jpg";
import galeriaBarbaArquivo from "@/assets/galeria-barba.jpg";
import galeriaCorteArquivo from "@/assets/galeria-corte.jpg";
import galeriaProdutosArquivo from "@/assets/galeria-produtos.jpg";
import heroPosterArquivo from "@/assets/hero-barbearia.jpg";
import heroVideoAsset from "@/assets/hero-barbearia.mp4.asset.json";
import sobreAcabamentoArquivo from "@/assets/sobre-acabamento.jpg";
import sobreCouroArquivo from "@/assets/sobre-couro.jpg";
import sobreFerramentasArquivo from "@/assets/sobre-ferramentas.jpg";

export interface ImagemSite {
  /** URL final da imagem (import processado pelo bundler). */
  readonly src: string;
  /** Texto alternativo descritivo — obrigatório para acessibilidade e SEO. */
  readonly alt: string;
  readonly largura: number;
  readonly altura: number;
}

/** Vídeo de fundo do hero (hospedado no CDN). */
export const heroVideo = heroVideoAsset.url;

/** Poster exibido enquanto o vídeo do hero carrega ou quando o autoplay é bloqueado. */
export const heroPoster: ImagemSite = {
  src: heroPosterArquivo,
  alt: "Cadeira de barbeiro em salão escuro com iluminação âmbar",
  largura: 1920,
  altura: 1088,
};

export const sobreImagem1: ImagemSite = {
  src: sobreCouroArquivo,
  alt: "Textura do couro envelhecido da cadeira de barbeiro com rebites de latão",
  largura: 1024,
  altura: 1536,
};

export const sobreImagem2: ImagemSite = {
  src: sobreFerramentasArquivo,
  alt: "Navalha, tesoura e máquina de corte sobre bancada de madeira escura",
  largura: 1536,
  altura: 1024,
};

export const sobreImagem3: ImagemSite = {
  src: sobreAcabamentoArquivo,
  alt: "Detalhe de acabamento com pente e tesoura ao lado de toalha quente",
  largura: 1536,
  altura: 1024,
};

export const galeriaImagem1: ImagemSite = {
  src: galeriaAmbienteArquivo,
  alt: "Salão da barbearia com cadeiras de couro e luminárias âmbar",
  largura: 1536,
  altura: 1024,
};

export const galeriaImagem2: ImagemSite = {
  src: galeriaBarbaArquivo,
  alt: "Navalha desenhando o contorno da barba",
  largura: 1024,
  altura: 1536,
};

export const galeriaImagem3: ImagemSite = {
  src: galeriaCorteArquivo,
  alt: "Acabamento de degradê com máquina na nuca do cliente",
  largura: 1536,
  altura: 1024,
};

export const galeriaImagem4: ImagemSite = {
  src: galeriaProdutosArquivo,
  alt: "Frascos âmbar, pincel de barbear e talqueira sobre bancada de pedra",
  largura: 1024,
  altura: 1024,
};

export const galeriaImagem5: ImagemSite = {
  src: sobreFerramentasArquivo,
  alt: "Ferramentas de barbeiro alinhadas sob luz quente",
  largura: 1536,
  altura: 1024,
};
