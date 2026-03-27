import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sphere, MeshDistortMaterial, Float, Ring } from "@react-three/drei";
import * as THREE from "three";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --void: #020408;
    --nebula-2: #0d1526;
    --pulse: #00d4ff;
    --flare: #ff6b35;
    --star-white: #e8f4ff;
    --text-dim: rgba(232,244,255,0.5);
    --font-display: 'Orbitron', monospace;
    --font-body: 'Rajdhani', sans-serif;
    --px: clamp(1.2rem, 5vw, 4rem);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--void);
    color: var(--star-white);
    font-family: var(--font-body);
    font-size: 18px;
    overflow-x: hidden;
  }

  /* Canvas */
  #canvas-wrap {
    position: fixed; inset: 0;
    z-index: 0; pointer-events: none;
  }

  .page { position: relative; z-index: 1; }

  /* ── Nav ───────────────────────────────── */
  nav {
    position: fixed; top: 0; left: 0; right: 0;
    z-index: 200;
    display: flex; justify-content: space-between; align-items: center;
    padding: 1.1rem var(--px);
    background: rgba(2,4,8,0.65);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0,212,255,0.1);
    transition: background 0.3s;
  }
  nav.solid { background: rgba(2,4,8,0.97); }

  .nav-logo {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: clamp(0.75rem, 3vw, 1.1rem);
    color: var(--pulse);
    letter-spacing: 0.2em;
    text-decoration: none;
    white-space: nowrap;
  }

  .nav-links {
    display: flex;
    gap: clamp(1rem, 3vw, 2.5rem);
    list-style: none;
  }

  .nav-links a {
    font-family: var(--font-body);
    font-weight: 500;
    font-size: clamp(0.75rem, 1.5vw, 0.95rem);
    letter-spacing: 0.15em;
    color: var(--text-dim);
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.25s;
    position: relative;
  }
  .nav-links a::after {
    content: '';
    position: absolute; bottom: -4px; left: 0;
    width: 0; height: 1px;
    background: var(--pulse);
    transition: width 0.3s;
  }
  .nav-links a:hover { color: var(--pulse); }
  .nav-links a:hover::after { width: 100%; }

  /* Hamburger */
  .hamburger {
    display: none;
    flex-direction: column; justify-content: space-between;
    width: 26px; height: 18px;
    background: none; border: none;
    cursor: pointer; padding: 0; z-index: 300;
  }
  .hamburger span {
    display: block; height: 1.5px; width: 100%;
    background: var(--pulse); border-radius: 2px;
    transition: transform 0.35s, opacity 0.35s;
    transform-origin: center;
  }
  .hamburger.open span:nth-child(1) { transform: translateY(8.25px) rotate(45deg); }
  .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .hamburger.open span:nth-child(3) { transform: translateY(-8.25px) rotate(-45deg); }

  /* Mobile drawer */
  .mobile-menu {
    display: none;
    position: fixed; inset: 0;
    z-index: 150;
    background: rgba(2,4,8,0.97);
    backdrop-filter: blur(20px);
    flex-direction: column;
    justify-content: center; align-items: center;
    gap: 2.5rem;
    opacity: 0; pointer-events: none;
    transition: opacity 0.35s;
  }
  .mobile-menu.open { opacity: 1; pointer-events: all; }
  .mobile-menu a {
    font-family: var(--font-display);
    font-size: clamp(1.6rem, 8vw, 2.8rem);
    font-weight: 700;
    letter-spacing: 0.2em;
    color: var(--star-white);
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.2s;
  }
  .mobile-menu a:hover { color: var(--pulse); }

  /* ── Hero ──────────────────────────────── */
  .hero {
    min-height: 100svh;
    display: flex; flex-direction: column; justify-content: center;
    padding: 6rem var(--px) 4rem;
    position: relative;
  }

  .hero-tag {
    font-family: var(--font-display);
    font-size: clamp(0.52rem, 1.5vw, 0.7rem);
    letter-spacing: 0.25em;
    color: var(--pulse);
    text-transform: uppercase;
    margin-bottom: 1.2rem;
    opacity: 0; animation: fadeUp 0.8s 0.4s forwards;
    line-height: 1.8;
  }

  .hero-name {
    font-family: var(--font-display);
    font-size: clamp(2.6rem, 12vw, 7rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
    opacity: 0; animation: fadeUp 0.8s 0.6s forwards;
  }
  .hero-name span {
    display: block;
    -webkit-text-stroke: 1px var(--pulse);
    color: transparent;
  }

  .hero-title {
    font-family: var(--font-body);
    font-size: clamp(0.8rem, 2.5vw, 1.4rem);
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--text-dim);
    text-transform: uppercase;
    margin-bottom: 2.5rem;
    opacity: 0; animation: fadeUp 0.8s 0.8s forwards;
  }

  .hero-cta {
    display: flex; flex-wrap: wrap; gap: 1rem;
    opacity: 0; animation: fadeUp 0.8s 1s forwards;
  }

  .btn {
    font-family: var(--font-display);
    font-size: clamp(0.6rem, 1.5vw, 0.75rem);
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    padding: 0.9rem 2rem;
    border: 1px solid var(--pulse);
    color: var(--pulse);
    background: transparent;
    cursor: pointer;
    transition: color 0.3s;
    position: relative; overflow: hidden;
    white-space: nowrap;
  }
  .btn::before {
    content: '';
    position: absolute; inset: 0;
    background: var(--pulse);
    transform: scaleX(0); transform-origin: left;
    transition: transform 0.3s; z-index: -1;
  }
  .btn:hover { color: var(--void); }
  .btn:hover::before { transform: scaleX(1); }

  .btn-ghost { border-color: rgba(232,244,255,0.2); color: var(--text-dim); }
  .btn-ghost:hover { color: var(--void); border-color: var(--star-white); }
  .btn-ghost::before { background: var(--star-white); }

  .section-wrap {
    padding: clamp(4rem, 10vw, 8rem) var(--px);
    max-width: 1200px; margin: 0 auto;
  }

  .section-label {
    font-family: var(--font-display);
    font-size: clamp(0.52rem, 1.2vw, 0.65rem);
    letter-spacing: 0.5em;
    color: var(--pulse);
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: clamp(1.7rem, 5vw, 3.5rem);
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 2.5rem;
  }

  .divider {
    width: 60px; height: 1px;
    background: var(--pulse);
    margin-bottom: 2.5rem;
  }
  .about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(2rem, 6vw, 5rem);
    align-items: center;
  }

  .about-text p {
    color: var(--text-dim);
    font-size: clamp(0.9rem, 1.8vw, 1.05rem);
    line-height: 1.8; font-weight: 300;
    margin-bottom: 1.2rem;
  }
  .about-text p strong { color: var(--star-white); font-weight: 500; }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
  }

  .stat-card {
    background: var(--nebula-2);
    padding: clamp(1rem, 3vw, 2rem);
    border: 1px solid rgba(0,212,255,0.08);
    transition: border-color 0.3s, transform 0.3s;
  }
  .stat-card:hover { border-color: rgba(0,212,255,0.4); transform: translateY(-4px); }

  .stat-num {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 900; color: var(--pulse);
    line-height: 1; margin-bottom: 0.5rem;
  }
  .stat-label {
    font-size: clamp(0.65rem, 1.3vw, 0.85rem);
    letter-spacing: 0.1em; color: var(--text-dim);
    text-transform: uppercase;
  }

  .skills-wrap { display: flex; flex-wrap: wrap; gap: 0.7rem; }

  .skill-pill {
    font-family: var(--font-display);
    font-size: clamp(0.58rem, 1.2vw, 0.7rem);
    letter-spacing: 0.15em;
    padding: 0.6rem 1.2rem;
    border: 1px solid rgba(0,212,255,0.25);
    color: var(--pulse);
    background: rgba(0,212,255,0.05);
    text-transform: uppercase;
    transition: all 0.25s; cursor: default;
  }
  .skill-pill:hover { background: rgba(0,212,255,0.15); border-color: var(--pulse); transform: scale(1.05); }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: 2px;
  }

  .project-card {
    background: var(--nebula-2);
    padding: clamp(1.4rem, 3vw, 2.5rem);
    border: 1px solid rgba(0,212,255,0.06);
    transition: all 0.35s;
    position: relative; overflow: hidden;
  }
  .project-card::before {
    content: '';
    position: absolute; top: 0; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, var(--pulse), transparent);
    transform: scaleX(0); transition: transform 0.4s;
  }
  .project-card:hover { border-color: rgba(0,212,255,0.2); transform: translateY(-5px); }
  .project-card:hover::before { transform: scaleX(1); }

  .project-tag {
    font-family: var(--font-display);
    font-size: 0.6rem; letter-spacing: 0.3em;
    color: var(--flare); text-transform: uppercase;
    margin-bottom: 0.8rem;
  }
  .project-name {
    font-family: var(--font-display);
    font-size: clamp(0.9rem, 2vw, 1.2rem);
    font-weight: 700; margin-bottom: 0.8rem; line-height: 1.3;
  }
  .project-desc {
    color: var(--text-dim);
    font-size: clamp(0.82rem, 1.5vw, 0.95rem);
    line-height: 1.7; font-weight: 300; margin-bottom: 1.5rem;
  }
  .project-footer {
    display: flex; align-items: center;
    justify-content: space-between;
    gap: 0.8rem; flex-wrap: wrap;
  }
  .tech-stack { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .tech-tag {
    font-size: 0.72rem; font-family: monospace;
    color: var(--text-dim);
    background: rgba(255,255,255,0.04);
    padding: 0.2rem 0.5rem; border-radius: 2px;
  }
  .project-link {
    font-family: var(--font-display);
    font-size: 0.65rem; letter-spacing: 0.2em;
    color: var(--pulse); text-decoration: none;
    text-transform: uppercase;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s; white-space: nowrap;
  }
  .project-link:hover { border-color: var(--pulse); }

  .contact-inner { max-width: 600px; }
  .contact-inner p {
    color: var(--text-dim);
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    line-height: 1.8; font-weight: 300;
    margin-bottom: 2rem;
  }
  .contact-links { display: flex; flex-direction: column; }
  .contact-item {
    display: flex; align-items: center; gap: 1.2rem;
    text-decoration: none; color: var(--star-white);
    font-size: clamp(0.82rem, 1.8vw, 1rem);
    letter-spacing: 0.04em;
    transition: color 0.25s;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    word-break: break-all;
  }
  .contact-item:hover { color: var(--pulse); }
  .contact-icon {
    font-size: 1.2rem; width: 2rem;
    text-align: center; color: var(--pulse); flex-shrink: 0;
  }

  footer {
    text-align: center;
    padding: 2.5rem var(--px);
    font-family: var(--font-display);
    font-size: clamp(0.48rem, 1.1vw, 0.65rem);
    letter-spacing: 0.2em;
    color: rgba(232,244,255,0.2);
    text-transform: uppercase;
    border-top: 1px solid rgba(255,255,255,0.04);
    line-height: 1.8;
  }

  /* Scroll hint */
  .scroll-hint {
    position: absolute; bottom: 2rem; left: 50%;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
    font-family: var(--font-display);
    font-size: 0.5rem; letter-spacing: 0.3em;
    color: var(--text-dim); text-transform: uppercase;
    animation: bounce 2s infinite;
  }
  .scroll-line {
    width: 1px; height: 36px;
    background: linear-gradient(to bottom, var(--pulse), transparent);
  }

  /* Glitch */
  .glitch { position: relative; }
  .glitch::before, .glitch::after {
    content: attr(data-text);
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    font-family: inherit; font-size: inherit; font-weight: inherit;
  }
  .glitch::before {
    color: var(--pulse);
    animation: glitch1 3s infinite;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  }
  .glitch::after {
    color: var(--flare);
    animation: glitch2 3s infinite;
    clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  }

  /* Keyframes */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bounce {
    0%,100% { transform: translateX(-50%) translateY(0); }
    50%     { transform: translateX(-50%) translateY(10px); }
  }
  @keyframes glitch1 {
    0%,90%,100% { transform:none; opacity:0; }
    92% { transform:translate(-3px); opacity:.8; }
    94% { transform:translate(3px);  opacity:.8; }
    96% { transform:translate(-3px); opacity:.8; }
    98% { transform:translate(0);    opacity:0; }
  }
  @keyframes glitch2 {
    0%,90%,100% { transform:none; opacity:0; }
    91% { transform:translate(3px);  opacity:.7; }
    93% { transform:translate(-3px); opacity:.7; }
    95% { transform:translate(3px);  opacity:.7; }
    97% { transform:translate(0);    opacity:0; }
  }

  /* ── Responsive: Tablet ≤ 900px ──────── */
  @media (max-width: 900px) {
    .hamburger  { display: flex; }
    .nav-links  { display: none; }
    .mobile-menu { display: flex; }

    .about-grid { grid-template-columns: 1fr; gap: 2.5rem; }
    .stats-grid { grid-template-columns: repeat(4, 1fr); }
  }

  /* ── Responsive: Mobile ≤ 600px ──────── */
  @media (max-width: 600px) {
    .hero-cta { flex-direction: column; }
    .btn      { text-align: center; }

    .stats-grid { grid-template-columns: 1fr 1fr; }

    .projects-grid { grid-template-columns: 1fr; }

    .scroll-hint { display: none; }
  }

  /* ── Responsive: Tiny ≤ 360px ────────── */
  @media (max-width: 360px) {
    .stat-num { font-size: 1.6rem; }
    .hero-name { font-size: 2.4rem; }
  }
`;

function Planet() {
  const planetRef = useRef();
  const atmosphereRef = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 0.12;
      planetRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = -t * 0.06;
      atmosphereRef.current.rotation.z = t * 0.03;
    }
    if (ringRef.current) ringRef.current.rotation.z = t * 0.04;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.6}>
      <group position={[3.5, 0.5, -3]}>
        <Sphere ref={planetRef} args={[1.8, 64, 64]}>
          <MeshDistortMaterial color="#1a3a6b" emissive="#0a1a3a" emissiveIntensity={0.4}
            roughness={0.6} metalness={0.3} distort={0.25} speed={1.5} />
        </Sphere>
        <Sphere ref={atmosphereRef} args={[2.05, 32, 32]}>
          <MeshDistortMaterial color="#00d4ff" transparent opacity={0.07} distort={0.5} speed={2} />
        </Sphere>
        <Sphere args={[2.3, 32, 32]}>
          <meshBasicMaterial color="#0044aa" transparent opacity={0.04} side={THREE.BackSide} />
        </Sphere>
        <group ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <Ring args={[2.6, 3.6, 80]}>
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.18} side={THREE.DoubleSide} />
          </Ring>
          <Ring args={[3.7, 4.2, 80]}>
            <meshBasicMaterial color="#ff6b35" transparent opacity={0.09} side={THREE.DoubleSide} />
          </Ring>
        </group>
        <pointLight color="#00d4ff" intensity={1.5} distance={12} />
      </group>
    </Float>
  );
}

function Moon() {
  const moonRef = useRef();
  const orbitRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (orbitRef.current) { orbitRef.current.rotation.y = t * 0.4; orbitRef.current.rotation.x = Math.sin(t * 0.15) * 0.3; }
    if (moonRef.current) moonRef.current.rotation.y = t * 0.8;
  });
  return (
    <group position={[3.5, 0.5, -3]}>
      <group ref={orbitRef}>
        <group position={[5.5, 0, 0]}>
          <Sphere ref={moonRef} args={[0.35, 32, 32]}>
            <MeshDistortMaterial color="#667799" emissive="#223344" emissiveIntensity={0.2}
              roughness={0.9} metalness={0.1} distort={0.1} speed={1} />
          </Sphere>
        </group>
      </group>
    </group>
  );
}

function Nebula() {
  const ref = useRef();
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.015; });
  return (
    <group ref={ref} position={[-4, 2, -10]}>
      {[...Array(5)].map((_, i) => (
        <Sphere key={i} args={[2 + i * 0.8, 12, 12]} position={[Math.sin(i*1.2)*1.5, Math.cos(i*0.9)*1.5, 0]}>
          <meshBasicMaterial color={i%2===0?"#001133":"#110022"} transparent opacity={0.12-i*0.018} side={THREE.BackSide} />
        </Sphere>
      ))}
    </group>
  );
}

function Scene() {
  const { camera } = useThree();
  useEffect(() => { camera.position.set(0, 0, 6); }, [camera]);
  useFrame(({ mouse, camera: cam }) => {
    cam.position.x += (mouse.x * 0.4 - cam.position.x) * 0.02;
    cam.position.y += (mouse.y * 0.2 - cam.position.y) * 0.02;
    cam.lookAt(0, 0, 0);
  });
  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight position={[-8,4,4]}  color="#4488ff" intensity={0.8} />
      <directionalLight position={[8,-2,-4]} color="#ff4422" intensity={0.3} />
      <Stars radius={150} depth={60} count={6000} factor={4} saturation={0.3} fade speed={0.8} />
      <Nebula /><Planet /><Moon />
    </>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────
const SKILLS = ["C++" ,"Python", "R" , "JavaScript", "HTML", "CSS", "SQL","React", "Vite" , "Next.js" , "MySQL"];

const PROJECTS = [
  { tag:"MERN Stack",  name:"AI Medical Voice Agent ", desc:"An AI chatbot for telemedicinal access.",              stack:["React","PostgreSQL","Express.js","Node.js"],    link:"https://github.com/RuzalSingla/DoctorAI/tree/main" },
  { tag:"React",     name:"Embrace",        desc:"An engaging website focused on women mental health and well being",      stack:["React"],       link:"https://embrace-sigma.vercel.app/" },
  { tag:"React",      name:"Finivesta",      desc:"A finance education platform for spreading awareness among college graduates",             stack:["React","MongoDB"],          link:"https://www.finivesta.in/" },
  ];

const NAV_ITEMS = ["About","Skills","Projects","Contact"];

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [navSolid, setNavSolid] = useState(false);
  const [menuOpen, setMenuOpen]  = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    const onScroll = () => setNavSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); document.head.removeChild(el); };
  }, []);

  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div id="canvas-wrap">
        <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
          <Suspense fallback={null}><Scene /></Suspense>
        </Canvas>
      </div>

      <div className="page">

        {/* Nav */}
        <nav className={navSolid ? "solid" : ""}>
          <a href="#" className="nav-logo">RUZAL.DEV</a>
          <ul className="nav-links">
            {NAV_ITEMS.map(l => <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>)}
          </ul>
          <button className={`hamburger${menuOpen?" open":""}`}
            onClick={() => setMenuOpen(o => !o)} aria-label="Toggle navigation">
            <span/><span/><span/>
          </button>
        </nav>

        {/* Mobile drawer */}
        <div className={`mobile-menu${menuOpen?" open":""}`}>
          {NAV_ITEMS.map(l => <a key={l} href={`#${l.toLowerCase()}`} onClick={closeMenu}>{l}</a>)}
        </div>

        {/* Hero */}
        <section className="hero" id="home">
          <p className="hero-tag">Frontend Engineer</p>
          <h1 className="hero-name glitch" data-text="RUZAL SINGLA">RUZAL<span>SINGLA</span></h1>
          <p className="hero-title">Building interfaces at the edge of the universe</p>
          <div className="hero-cta">
            <a href="#projects" className="btn">View My Work</a>
            <a href="#contact"  className="btn btn-ghost">Say Hello</a>
          </div>
          <div className="scroll-hint"><span>Scroll</span><div className="scroll-line"/></div>
        </section>

        {/* About */}
        <div className="section-wrap" id="about">
          <p className="section-label">// 001 — About</p>
          <div className="divider"/>
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">Crafting <br/>experiences that matter</h2>
              <p>I’m Ruzal Singla, a second-year Computer Science and Artificial Intelligence engineering student at Indira Gandhi Delhi Technical University for Women (IGDTUW). With a strong interest in coding, problem-solving, and creative development, I enjoy working at the intersection of technology and innovation.</p><p>
              I love building interactive websites, experimenting with modern frameworks, and strengthening my skills in Data Structures and Algorithms (DSA).</p><p> Beyond technical skills, I value curiosity, continuous learning, and collaboration — qualities that drive me to explore new fields like AI, machine learning, and cybersecurity.
              My goal is to keep growing as an engineer, contribute to impactful projects, and collaborate with like-minded people who are equally passionate about technology.</p>
            </div>
            <div className="stats-grid">
              {[{num:"1+",label:"Years Experience"},{num:"2",label:"Projects Shipped"}].map(s=>(
                <div className="stat-card" key={s.label}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="section-wrap" id="skills">
          <p className="section-label">// 002 — Skills</p>
          <div className="divider"/>
          <h2 className="section-title">Technology<br/>Arsenal</h2>
          <div className="skills-wrap">
            {SKILLS.map(s => <div className="skill-pill" key={s}>{s}</div>)}
          </div>
        </div>

        {/* Projects */}
        <div className="section-wrap" id="projects">
          <p className="section-label">// 003 — Projects</p>
          <div className="divider"/>
          <h2 className="section-title">Selected<br/>Work</h2>
          <div className="projects-grid">
            {PROJECTS.map(p => (
              <div className="project-card" key={p.name}>
                <p className="project-tag">{p.tag}</p>
                <h3 className="project-name">{p.name}</h3>
                <p className="project-desc">{p.desc}</p>
                <div className="project-footer">
                  <div className="tech-stack">{p.stack.map(t=><span className="tech-tag" key={t}>{t}</span>)}</div>
                  <a href={p.link} className="project-link">View →</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="section-wrap" id="contact">
          <p className="section-label">// 004 — Contact</p>
          <div className="divider"/>
          <div className="contact-inner">
            <h2 className="section-title">Let's build<br/>something great</h2>
            <p>Whether you have a project in mind, a position to fill, or just want to geek out about distributed systems — my inbox is always open.</p>
            <div className="contact-links">
              {[
                {icon:"✉",label:"ruzalsingla2301@gmail.com",     href:"mailto:ruzalsingla2301@gmail.com"},
                {icon:"⌥",label:"github.com/RuzalSingla",      href:"https://github.com/RuzalSingla"},
                {icon:"◈",label:"linkedin.com/in/RuzalSingla", href:"https://www.linkedin.com/in/ruzal-singla-a05861324/"},
              ].map(c=>(
                <a href={c.href} className="contact-item" key={c.label}>
                  <span className="contact-icon">{c.icon}</span>
                  <span>{c.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <footer><p>© 2026 Ruzal Singla · Built with React + Three.js · Somewhere in the cosmos</p></footer>
      </div>
    </>
  );
}