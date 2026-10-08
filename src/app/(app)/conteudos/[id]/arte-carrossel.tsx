"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import type { Arte, Perfil } from "@/lib/tipos";

// Tamanho de post retrato do Instagram (4:5).
const LARGURA = 1080;
const ALTURA = 1350;
const ESCALA = 0.25;

export function ArteCarrossel({ arte, perfil }: { arte: Arte; perfil: Perfil }) {
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const [baixando, setBaixando] = useState(false);
  const total = arte.slides.length;

  async function imagem(i: number) {
    const no = slides.current[i];
    if (!no) throw new Error("slide não encontrado");
    return toPng(no, { width: LARGURA, height: ALTURA, pixelRatio: 1, cacheBust: true });
  }

  async function baixarUm(i: number) {
    const link = document.createElement("a");
    link.href = await imagem(i);
    link.download = `slide-${i + 1}.png`;
    link.click();
  }

  async function baixarTodos() {
    setBaixando(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < total; i++) {
        const dados = await imagem(i);
        zip.file(`slide-${String(i + 1).padStart(2, "0")}.png`, dados.split(",")[1], { base64: true });
      }
      const arquivo = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(arquivo);
      link.download = `carrossel-${perfil.arroba.replace("@", "")}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } finally {
      setBaixando(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {arte.slides.map((slide, i) => {
          const capa = i === 0;
          const fundo = capa ? perfil.cor_primaria : perfil.cor_secundaria;
          const destaque = capa ? perfil.cor_secundaria : perfil.cor_primaria;
          return (
            <figure key={i} className="shrink-0">
              <div
                className="overflow-hidden rounded-lg shadow-sm"
                style={{ width: LARGURA * ESCALA, height: ALTURA * ESCALA }}
              >
                <div style={{ transform: `scale(${ESCALA})`, transformOrigin: "top left" }}>
                  <div
                    ref={(el) => {
                      slides.current[i] = el;
                    }}
                    style={{
                      width: LARGURA,
                      height: ALTURA,
                      background: fundo,
                      color: capa ? perfil.cor_secundaria : "#2A1A1D",
                      padding: 110,
                      display: "flex",
                      flexDirection: "column",
                      fontFamily: "var(--fonte-texto), sans-serif",
                    }}
                  >
                    <span style={{ fontSize: 30, letterSpacing: 4, color: destaque, opacity: 0.8 }}>
                      {capa ? "" : String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      style={{
                        fontFamily: "var(--fonte-titulo), serif",
                        fontSize: capa ? 120 : 100,
                        lineHeight: 1.08,
                        fontWeight: 400,
                        color: destaque,
                        marginTop: "auto",
                      }}
                    >
                      {slide.titulo}
                    </h3>
                    {slide.texto && (
                      <p style={{ fontSize: 48, lineHeight: 1.45, marginTop: 56, opacity: 0.9 }}>{slide.texto}</p>
                    )}
                    <div
                      style={{
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 30,
                        color: destaque,
                        opacity: 0.85,
                      }}
                    >
                      <span>{perfil.arroba}</span>
                      <span>{capa ? "arraste →" : `${i + 1}/${total}`}</span>
                    </div>
                  </div>
                </div>
              </div>
              <figcaption className="mt-2 text-center">
                <button onClick={() => baixarUm(i)} className="text-xs text-cinza hover:text-vinho">
                  Baixar slide {i + 1}
                </button>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <button
        onClick={baixarTodos}
        disabled={baixando}
        className="rounded-full border border-vinho px-6 py-2.5 text-sm font-medium text-vinho hover:bg-vinho hover:text-creme disabled:opacity-60"
      >
        {baixando ? "Preparando..." : `Baixar os ${total} slides (.zip)`}
      </button>
    </div>
  );
}
