import type { ImagemSite } from "@/lib/imagens";
import {
  galeriaImagem1,
  galeriaImagem2,
  galeriaImagem3,
  galeriaImagem4,
  galeriaImagem5,
} from "@/lib/imagens";

/**
 * Mosaico editorial: cada item define sua área no grid de 6 colunas.
 * Para trocar por fotos reais basta editar src/lib/imagens.ts — a estrutura
 * do mosaico continua igual.
 */
interface ItemMosaico {
  readonly imagem: ImagemSite;
  /** Classes de posicionamento no grid (mobile-first). */
  readonly area: string;
}

const MOSAICO: readonly ItemMosaico[] = [
  { imagem: galeriaImagem1, area: "col-span-2 aspect-[4/3] md:col-span-4 md:row-span-2" },
  { imagem: galeriaImagem2, area: "col-span-1 aspect-[3/4] md:col-span-2 md:row-span-3" },
  { imagem: galeriaImagem4, area: "col-span-1 aspect-square md:col-span-2 md:row-span-2" },
  { imagem: galeriaImagem3, area: "col-span-2 aspect-[16/9] md:col-span-2 md:row-span-2" },
  { imagem: galeriaImagem5, area: "col-span-2 aspect-[16/9] md:col-span-2 md:row-span-2" },
];

export function SecaoGaleria() {
  return (
    <section id="galeria" className="border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <p className="text-eyebrow">Galeria</p>
        <h2 className="mt-4 text-3xl font-semibold uppercase md:text-4xl">Ambiente e trabalho</h2>

        <div className="mt-10 grid auto-rows-auto grid-cols-2 gap-2 md:grid-cols-6 md:gap-3">
          {MOSAICO.map(({ imagem, area }) => (
            <figure
              key={imagem.src}
              className={`group relative isolate overflow-hidden border border-border/70 bg-card ${area}`}
            >
              <img
                src={imagem.src}
                alt={imagem.alt}
                loading="lazy"
                decoding="async"
                width={imagem.largura}
                height={imagem.altura}
                className="foto-tratada size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                aria-hidden
                className="foto-overlay pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-40"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}