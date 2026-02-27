import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type HeroVariant = "circles" | "squares" | "triangles" | "hexagons" | "waves" | "dots";

interface PageHeroProps {
  breadcrumb: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  variant?: HeroVariant;
}

/* ── Distinct geometric sets per variant ── */

const CirclesDecoration = () => (
  <>
    <motion.div className="absolute -top-10 -right-10 w-[220px] h-[220px] rounded-full border border-primary/[0.08]"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} />
    <motion.div className="absolute top-6 right-6 w-[140px] h-[140px] rounded-full border border-primary/[0.06]"
      initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, delay: 0.15 }} />
    <motion.div className="absolute top-[60px] right-[60px] w-3 h-3 rounded-full bg-primary/[0.1]"
      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />
    <motion.div className="absolute bottom-4 left-[12%] w-16 h-16 rounded-full border border-primary/[0.06]"
      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.5 }} />
    <motion.div className="absolute top-[40%] left-[5%] w-2 h-2 rounded-full bg-primary/[0.07]"
      initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 0.8 }} />
  </>
);

const SquaresDecoration = () => (
  <>
    <motion.div className="absolute -top-6 -right-6 w-[180px] h-[180px] border border-primary/[0.07] rounded-lg rotate-12"
      initial={{ opacity: 0, rotate: 0 }} animate={{ opacity: 1, rotate: 12 }} transition={{ duration: 1 }} />
    <motion.div className="absolute top-8 right-12 w-[100px] h-[100px] border border-primary/[0.05] rounded-md rotate-6"
      initial={{ opacity: 0, rotate: -5 }} animate={{ opacity: 1, rotate: 6 }} transition={{ duration: 1.2, delay: 0.2 }} />
    <motion.div className="absolute top-[50px] right-[50px] w-4 h-4 bg-primary/[0.06] rounded-sm rotate-45"
      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }} />
    <motion.div className="absolute bottom-2 left-[8%] w-8 h-8 border border-primary/[0.06] rounded-sm -rotate-12"
      initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.5 }} />
    <motion.div className="absolute top-[35%] left-[3%] w-5 h-5 border border-primary/[0.05] rotate-45"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }} />
    <motion.div className="absolute bottom-6 right-[30%] w-1.5 h-1.5 bg-primary/[0.06] rotate-45"
      initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.4, 0.8] }} transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }} />
  </>
);

const TrianglesDecoration = () => (
  <>
    {/* Large triangle outline */}
    <motion.svg className="absolute -top-4 -right-4 w-[200px] h-[200px] text-primary" viewBox="0 0 200 200"
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
      <polygon points="100,10 190,180 10,180" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.07" />
    </motion.svg>
    {/* Medium triangle */}
    <motion.svg className="absolute top-4 right-8 w-[120px] h-[120px] text-primary" viewBox="0 0 120 120"
      initial={{ opacity: 0, scale: 0.7, rotate: 15 }} animate={{ opacity: 1, scale: 1, rotate: 15 }} transition={{ duration: 1.2, delay: 0.2 }}>
      <polygon points="60,5 115,110 5,110" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.06" />
    </motion.svg>
    {/* Small filled triangle */}
    <motion.svg className="absolute top-[65px] right-[65px] w-[30px] h-[30px] text-primary" viewBox="0 0 30 30"
      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
      <polygon points="15,2 28,26 2,26" fill="currentColor" opacity="0.06" />
    </motion.svg>
    {/* Bottom-left chevron */}
    <motion.svg className="absolute bottom-3 left-[10%] w-[40px] h-[40px] text-primary" viewBox="0 0 40 40"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
      <polyline points="5,30 20,10 35,30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.07" />
    </motion.svg>
    <motion.div className="absolute top-[45%] left-[4%] w-2 h-2 bg-primary/[0.06] rotate-45"
      initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", delay: 0.7 }} />
  </>
);

const HexagonsDecoration = () => {
  const hex = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
    return pts;
  };
  return (
    <>
      <motion.svg className="absolute -top-6 -right-6 w-[220px] h-[220px] text-primary" viewBox="0 0 220 220"
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1 }}>
        <polygon points={hex(110, 100, 80)} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.07" />
      </motion.svg>
      <motion.svg className="absolute top-6 right-10 w-[130px] h-[130px] text-primary" viewBox="0 0 130 130"
        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.15 }}>
        <polygon points={hex(65, 65, 45)} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.06" />
      </motion.svg>
      <motion.svg className="absolute top-[55px] right-[55px] w-[40px] h-[40px] text-primary" viewBox="0 0 40 40"
        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.35 }}>
        <polygon points={hex(20, 20, 12)} fill="currentColor" opacity="0.05" />
      </motion.svg>
      <motion.svg className="absolute bottom-2 left-[9%] w-[50px] h-[50px] text-primary" viewBox="0 0 50 50"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}>
        <polygon points={hex(25, 25, 18)} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.06" />
      </motion.svg>
      <motion.div className="absolute top-[40%] left-[4%] w-2.5 h-2.5 rounded-full bg-primary/[0.06]"
        initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9, 0.4, 0.9] }} transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 0.7 }} />
    </>
  );
};

const WavesDecoration = () => (
  <>
    <motion.svg className="absolute -top-2 -right-4 w-[240px] h-[160px] text-primary" viewBox="0 0 240 160"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
      <path d="M0,80 C40,40 80,120 120,80 C160,40 200,120 240,80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.07" />
      <path d="M0,100 C40,60 80,140 120,100 C160,60 200,140 240,100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.05" />
      <path d="M0,60 C40,20 80,100 120,60 C160,20 200,100 240,60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04" />
    </motion.svg>
    <motion.div className="absolute bottom-4 left-[6%] w-px h-14 bg-gradient-to-b from-transparent via-primary/[0.08] to-transparent"
      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.7, delay: 0.3 }} />
    <motion.div className="absolute bottom-6 left-[8%] w-6 h-px bg-primary/[0.08]"
      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, delay: 0.5 }} />
    <motion.div className="absolute top-[50%] left-[3%] w-2 h-2 rounded-full bg-primary/[0.06]"
      initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse" }} />
  </>
);

const DotsDecoration = () => (
  <>
    {/* Dot grid pattern — top right */}
    <motion.svg className="absolute -top-2 -right-2 w-[200px] h-[160px] text-primary" viewBox="0 0 200 160"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => (
          <circle key={`${r}-${c}`} cx={20 + c * 32} cy={20 + r * 32} r="2" fill="currentColor"
            opacity={0.03 + (r + c) * 0.008} />
        ))
      )}
    </motion.svg>
    {/* Larger accent dots */}
    <motion.div className="absolute top-[40px] right-[40px] w-4 h-4 rounded-full border border-primary/[0.08]"
      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }} />
    <motion.div className="absolute top-[55px] right-[55px] w-2 h-2 rounded-full bg-primary/[0.08]"
      initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.45 }} />
    <motion.div className="absolute bottom-3 left-[7%] w-3 h-3 rounded-full border border-primary/[0.06]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }} />
    <motion.div className="absolute top-[50%] left-[4%] w-1.5 h-1.5 rounded-full bg-primary/[0.06]"
      initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0.3, 0.8] }} transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }} />
  </>
);

const decorationMap: Record<HeroVariant, React.FC> = {
  circles: CirclesDecoration,
  squares: SquaresDecoration,
  triangles: TrianglesDecoration,
  hexagons: HexagonsDecoration,
  waves: WavesDecoration,
  dots: DotsDecoration,
};

export const PageHero = ({ breadcrumb, title, titleAccent, subtitle, variant = "circles" }: PageHeroProps) => {
  const Decoration = decorationMap[variant];

  return (
    <section className="relative pt-8 pb-12 overflow-hidden bg-gradient-to-b from-primary/[0.04] to-transparent">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Decoration />
      </div>

      <div className="container relative">
        <motion.div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{breadcrumb}</span>
        </motion.div>

        <motion.h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-heading text-foreground tracking-tight leading-tight mb-4"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
          {title}{" "}
          {titleAccent && <span className="text-primary">{titleAccent}</span>}
        </motion.h1>

        <motion.p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
};
