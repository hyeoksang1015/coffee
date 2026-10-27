"use client";

import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";
import { GALLERY, type Bean } from "@/data/beans";

/** 상세 사진: 원두 사진 + 공통 사진 3장. 썸네일을 누르면 큰 사진이 바뀐다. */
export default function Gallery({ bean }: { bean: Bean }) {
  const shots = [{ src: bean.image, label: "PACKAGE", alt: bean.imageAlt }, ...GALLERY];
  const [i, setI] = useState(0);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-surface-container-lowest shadow-md">
      <div className="pointer-events-none absolute top-0 left-0 z-10 flex flex-wrap items-center gap-space-xs p-4">
        <span className="rounded bg-surface/90 px-3 py-1 text-label-caps uppercase tracking-wider text-navy-ink shadow-sm backdrop-blur-md">LOT {bean.detail.lot}</span>
        <span className="flex items-center gap-1 rounded bg-primary px-3 py-1 text-spec-num text-on-primary shadow-sm">
          <Star className="size-3.5" aria-hidden="true" /> {bean.detail.score} SCA CUP
        </span>
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
        <Image src={shots[i].src} alt={shots[i].alt} fill priority sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
      </div>
      <div className="grid grid-cols-4 gap-space-xs bg-surface-container-low p-space-sm">
        {shots.map((s, n) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setI(n)}
            aria-label={`${s.label} 사진 보기`}
            aria-pressed={i === n}
            className={`relative aspect-video overflow-hidden rounded ring-cobalt-electric ring-offset-2 ring-offset-surface-container-low ${i === n ? "ring-2" : "opacity-80 hover:opacity-100"}`}
          >
            <Image src={s.src} alt="" fill sizes="160px" className="object-cover" />
            <span className="absolute bottom-1 left-2 text-[10px] font-semibold tracking-wider text-on-primary drop-shadow">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
