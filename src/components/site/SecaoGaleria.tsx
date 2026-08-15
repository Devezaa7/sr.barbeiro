import ambiente from "@/assets/galeria-ambiente.jpg";
import barba from "@/assets/galeria-barba.jpg";
import corte from "@/assets/galeria-corte.jpg";
import ferramentas from "@/assets/galeria-ferramentas.jpg";

/**
 * Estrutura pronta para troca pelas fotos reais: basta substituir os arquivos
 * em src/assets mantendo os mesmos nomes, ou trocar os imports abaixo.
 */
const IMAGENS = [
  { src: ferramentas, alt: "Ferramentas de barbeiro sobre bancada escura" },
  { src: barba, alt: "Modelagem de barba com navalha" },
  { src: corte, alt: "Acabamento de corte masculino degradê" },
  { src: ambiente, alt: "Área de espera climatizada da barbearia" },
] as const;

export function SecaoGaleria() {
  return (
    <section id="galeria" className="border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 md:px-6 md:py-28">
        <p className="text-eyebrow">Galeria</p>
        <h2 className="mt-4 text-3xl font-semibold uppercase md:text-4xl">Ambiente e trabalho</h2>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {IMAGENS.map((imagem) => (
            <figure key={imagem.alt} className="overflow-hidden border border-border/70">
              <img
                src={imagem.src}
                alt={imagem.alt}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square size-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}