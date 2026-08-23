import galeriaAmbienteArquivo from "@/assets/galeria-ambiente.jpg";
import galeriaBarbaArquivo from "@/assets/galeria-barba.jpg";
import galeriaCorteArquivo from "@/assets/galeria-corte.jpg";
import galeriaProdutosArquivo from "@/assets/galeria-produtos.jpg";
import heroPosterArquivo from "@/assets/hero-barbearia.jpg";
import heroVideoArquivo from "@/assets/hero-barbearia.mp4";
import logoSrBarbeiroArquivo from "@/assets/logo-sr-barbeiro.png";
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

/** Logo oficial da barbearia. */
export const logoMarca = {
  src: logoSrBarbeiroArquivo,
  alt: "Logo Sr. Barbeiro",
};

/** Vídeo de fundo do hero (empacotado pelo bundler, versionado no repositório). */
export const heroVideo: string = heroVideoArquivo;

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
