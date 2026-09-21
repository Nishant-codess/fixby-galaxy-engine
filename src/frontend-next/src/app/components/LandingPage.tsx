"use client";

import { useEffect, useRef, useState, useCallback } from "react";

function TypewriterHero() {
  const textRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const phrases = [
      '"my phone is getting really hot"',
      '"mera phone garam ho raha hai"'
    ];

    let cancelled = false;

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    async function run() {
      while (!cancelled) {
        for (const phrase of phrases) {
          if (cancelled) return;
          // Type forward
          for (let i = 0; i <= phrase.length; i++) {
            if (cancelled) return;
            if (textRef.current) textRef.current.textContent = phrase.slice(0, i);
            await sleep(60);
          }
          await sleep(2200);

          // Delete — select-all style fast wipe
          const len = phrase.length;
          for (let i = len; i >= 0; i--) {
            if (cancelled) return;
            if (textRef.current) textRef.current.textContent = phrase.slice(0, i);
            await sleep(25);
          }
          await sleep(500);
        }
      }
    }

    run();

    // Blinking cursor
    const cursorInterval = setInterval(() => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = 
          cursorRef.current.style.opacity === '0' ? '1' : '0';
      }
    }, 530);

    return () => { cancelled = true; clearInterval(cursorInterval); };
  }, []);

  return (
    <>
      <span ref={textRef} />
      <span ref={cursorRef} style={{
        display: 'inline-block',
        width: '3px',
        height: '0.85em',
        background: 'var(--text-hi)',
        marginLeft: '4px',
        verticalAlign: 'baseline',
        transition: 'opacity 0.15s ease',
      }} />
    </>
  );
}

export default function LandingPage({ onEnterConsole }: { onEnterConsole: () => void }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Load all legacy scripts sequentially to guarantee execution order and prevent 'not a constructor' errors
    const scriptsToLoad = [
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js",
      "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js",
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js",
      "https://unpkg.com/lenis@1.3.26/dist/lenis.min.js",
      "/js/3d_scroll_engine.js"
    ];

    let currentScript = 0;
    
    function loadNextScript() {
      if (currentScript >= scriptsToLoad.length) {
        initScrollEngine();
        return;
      }
      
      const src = scriptsToLoad[currentScript];
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        currentScript++;
        loadNextScript();
        return;
      }
      
      const script = document.createElement("script");
      script.src = src;
      script.async = false; // Force synchronous execution behavior
      script.onload = () => {
        currentScript++;
        loadNextScript();
      };
      document.body.appendChild(script);
    }
    
    function initScrollEngine() {
      const w = window as any;
      if (!w.Lenis || !w.gsap || !w.ScrollTrigger) return;
      
      // Initialize Lenis for smooth scrolling
      const lenis = new w.Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });
      w.lenis = lenis;

      // ─── CRITICAL: Bridge Lenis virtual scroll into GSAP ScrollTrigger ───
      // Without this, ScrollTrigger reads native scroll position (always 0)
      // and the 3D phone never moves.
      w.ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value?: number) {
          if (arguments.length && value !== undefined) {
            lenis.scrollTo(value, { immediate: true });
          }
          return lenis.scroll;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: document.body.style.transform ? 'transform' : 'fixed',
      });

      lenis.on('scroll', () => w.ScrollTrigger.update());

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    loadNextScript();
  }, []);

  return (
    <>
      {/* Canvas MUST be position:fixed behind everything, exactly like the original index.html */}
      <canvas
        id="webgl-canvas"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          outline: 'none',
        }}
      ></canvas>

      <div className="progressive-blur">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>

      <div id="depth-rail" className="depth-rail">
        <div className="rail-line"></div>
        <div className="rail-indicator" id="depth-indicator"></div>
      </div>

      <nav className="glass-vapor main-nav">
        <div className="nav-brand">Fixby</div>
        <button onClick={onEnterConsole} className="nav-link data" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Skip to console →</button>
      </nav>

      <main id="descent-track">
        <section className="beat" id="beat-1" style={{height: '100vh', position: 'relative', zIndex: 10}}>
          <div className="container hero-container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', paddingTop: '20vh'}}>
            <h1 className="display hero-headline" style={{maxWidth: '20ch', minHeight: '2.4em'}}>
              <span style={{color: 'var(--text-hi)'}}><TypewriterHero /></span>
            </h1>
            <p className="h3" style={{maxWidth: '48ch', marginTop: '24px'}}>
              Four words, no technical terms, no idea which setting is wrong. <br />
              Fixby turns it into one tap on the right screen.
            </p>
            <div style={{marginTop: '48px', display: 'flex', gap: '16px'}}>
              <button onClick={onEnterConsole} className="btn btn-primary glass-pane" style={{padding: '12px 24px', borderRadius: 'var(--r-tight)', color: 'var(--text-hi)', cursor: 'pointer', border: 'none'}}>Try it</button>
              <button className="btn btn-secondary glass-pane" style={{padding: '12px 24px', borderRadius: 'var(--r-tight)', color: 'var(--text-mid)', border: 'none', cursor: 'pointer'}}>See how ↓</button>
            </div>
          </div>
        </section>

        {/* Beat 2 — Terminal card: fake link hallucination */}
        <section className="beat" id="beat-2" style={{height: '120vh', position: 'relative'}}>
          <div className="container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', alignItems: 'flex-end'}}>
            <div className="glass-pane card" style={{maxWidth: '520px', padding: '0', overflow: 'hidden', border: '1px solid rgba(255,80,80,0.15)'}}>
              {/* Terminal header */}
              <div style={{background: 'rgba(255,60,60,0.08)', padding: '12px 20px', borderBottom: '1px solid rgba(255,80,80,0.12)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block'}} />
                <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e', display: 'inline-block'}} />
                <span style={{width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block'}} />
                <span style={{marginLeft: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace'}}>llm_response.txt</span>
              </div>
              <div style={{padding: '32px 36px 36px'}}>
                <h2 className="h2">Ask a normal model and it invents a link</h2>
                <p style={{marginTop: '14px', color: 'var(--text-mid)', lineHeight: 1.6}}>Language models are trained on the open web. When they don&apos;t know a settings path, they write one that <em>looks</em> right.</p>
                <div style={{marginTop: '24px', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '16px 20px', fontFamily: 'monospace', fontSize: '13px', border: '1px solid rgba(255,80,80,0.2)'}}>
                  <div style={{color: 'rgba(255,255,255,0.3)', marginBottom: '6px', fontSize: '11px'}}>$ suggested path</div>
                  <div style={{color: '#ff6b6b', textDecoration: 'line-through'}}>samsung.com/support/battery-fix-s24</div>
                  <div style={{color: 'rgba(255,100,100,0.6)', marginTop: '6px', fontSize: '12px'}}>⚠ 404 Not Found — does not exist</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="beat" id="beat-3" style={{height: '70vh', position: 'relative', pointerEvents: 'none'}}></section>

        {/* Beat 4 — Pipeline diagram: cache cascade */}
        <section className="beat" id="beat-4" style={{height: '120vh', position: 'relative'}}>
          <div className="container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%'}}>
            <div className="glass-pane card" style={{maxWidth: '520px', padding: '40px 44px'}}>
              <h2 className="h2">The cache cascade</h2>
              <p style={{marginTop: '14px', color: 'var(--text-mid)', lineHeight: 1.6}}>Queries resolve at the fastest, cheapest tier available before ever touching the heavy model.</p>
              <div style={{marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '0'}}>
                {[
                  { label: 'Exact Match Cache', sublabel: '< 2ms', color: '#4ade80', fill: 1 },
                  { label: 'Semantic Vector Store', sublabel: '< 40ms', color: '#60a5fa', fill: 0.7 },
                  { label: 'RAG + Knowledge Graph', sublabel: '< 200ms', color: '#a78bfa', fill: 0.45 },
                  { label: 'Deep LLM Fallback', sublabel: '< 800ms', color: '#f472b6', fill: 0.15 },
                ].map((tier, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none'}}>
                    <div style={{width: '8px', height: '8px', borderRadius: '50%', background: tier.color, boxShadow: `0 0 8px ${tier.color}`, flexShrink: 0}} />
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '13px', fontWeight: 600, color: 'var(--text-hi)'}}>{tier.label}</div>
                      <div style={{height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', marginTop: '6px', overflow: 'hidden'}}>
                        <div style={{height: '100%', width: `${tier.fill * 100}%`, background: `linear-gradient(90deg, ${tier.color}99, ${tier.color})`, borderRadius: '2px'}} />
                      </div>
                    </div>
                    <div style={{fontSize: '12px', color: tier.color, fontFamily: 'monospace', fontWeight: 600, flexShrink: 0}}>{tier.sublabel}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Beat 5 — Constrained retrieval */}
        <section className="beat" id="beat-5" style={{height: '120vh', position: 'relative'}}>
          <div className="container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', alignItems: 'flex-end'}}>
            <div className="glass-pane card" style={{maxWidth: '520px', padding: '40px 44px', border: '1px solid rgba(74,222,128,0.12)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
                <div style={{width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'}}>🔒</div>
                <span style={{fontSize: '11px', fontFamily: 'monospace', color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase'}}>Constrained Output</span>
              </div>
              <h2 className="h2">The model never writes a link. It picks one.</h2>
              <p style={{marginTop: '14px', color: 'var(--text-mid)', lineHeight: 1.6}}>Retrieval hands it five verified IDs from Samsung&apos;s catalogue. The output format accepts nothing else. A fabricated URL has no code path to be produced.</p>
              <div style={{marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {['SKG-4821', 'SKG-0093', 'SKG-1147', 'SKG-7732', 'SKG-5501'].map(id => (
                  <span key={id} style={{padding: '4px 10px', borderRadius: '6px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', fontSize: '12px', fontFamily: 'monospace', color: '#4ade80'}}>{id}</span>
                ))}
              </div>
              <div style={{marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace'}}>✓ Selected: SKG-4821 — Battery &gt; Optimization &gt; Background Activity</div>
            </div>
          </div>
        </section>

        {/* Beat 6 — SHKG trace */}
        <section className="beat" id="beat-6" style={{height: '140vh', position: 'relative'}}>
          <div className="container" style={{position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
            <div className="glass-pane card" style={{maxWidth: '520px', padding: '40px 44px'}}>
              <h2 className="h2">Parent menus are the wrong answer</h2>
              <p style={{marginTop: '14px', color: 'var(--text-mid)', lineHeight: 1.6}}>&quot;Go to Settings &gt; Display&quot; still leaves the user hunting. Fixby descends the full Samsung Hierarchical Knowledge Graph to output the exact leaf node.</p>
              <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace', fontSize: '12px'}}>
                {[
                  { label: '◉ Settings', depth: 0, done: true },
                  { label: '◉ Battery & Device Care', depth: 1, done: true },
                  { label: '◉ Battery', depth: 2, done: true },
                  { label: '▶ Background usage limits', depth: 3, done: false },
                ].map((node, i) => (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: `${node.depth * 16}px`}}>
                    <span style={{color: node.done ? 'var(--trace)' : 'rgba(255,255,255,0.25)'}}>{node.label}</span>
                    {node.done && <span style={{color: 'rgba(255,255,255,0.2)', fontSize: '10px'}}>✓</span>}
                  </div>
                ))}
              </div>
              <div className="data" style={{marginTop: '20px', color: 'var(--trace)', fontSize: '12px', fontFamily: 'monospace'}}>Tracing path... depth 12 of 18</div>
            </div>
          </div>
        </section>

        {/* Beat 6.5 — UI automation glitch card */}
        <section className="beat" id="beat-6-5" style={{height: '120vh', position: 'relative'}}>
          <div className="container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', alignItems: 'flex-end'}}>
            <div className="glass-pane card" style={{maxWidth: '520px', padding: '0', overflow: 'hidden', border: '1px solid rgba(255,60,60,0.18)'}}>
              <div style={{background: 'rgba(255,40,40,0.06)', padding: '14px 24px', borderBottom: '1px solid rgba(255,60,60,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '12px', fontFamily: 'monospace', color: '#ff6b6b'}}>EXCEPTION: AccessibilityServiceCrash</span>
                <span style={{fontSize: '11px', color: 'rgba(255,100,100,0.5)'}}>OneUI 7.1</span>
              </div>
              <div style={{padding: '32px 36px 36px'}}>
                <h2 className="h2">UI automation always breaks</h2>
                <p style={{marginTop: '14px', color: 'var(--text-mid)', lineHeight: 1.6}}>Simulating screen taps via accessibility services is incredibly fragile. A single OS update, theme change, or font size adjustment breaks the entire pipeline.</p>
                <div style={{marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {['OS Update 7.1.2 → tap target shifted 4px', 'Theme change → element ID reassigned', 'Font scale 1.3× → layout overflow, tap missed'].map((err, i) => (
                    <div key={i} style={{display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255,100,100,0.7)'}}>
                      <span style={{flexShrink: 0, color: '#ff6b6b'}}>✗</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beat 7 — Broken progress bar: manual troubleshooting */}
        <section className="beat" id="beat-7" style={{height: '120vh', position: 'relative'}}>
          <div className="container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', alignItems: 'flex-start'}}>
            <div className="glass-pane card" style={{maxWidth: '520px', padding: '40px 44px'}}>
              <h2 className="h2">Manual troubleshooting is archaic</h2>
              <p style={{marginTop: '14px', color: 'var(--text-mid)', lineHeight: 1.6}}>Users are forced to dig through outdated YouTube tutorials and dead forum threads just to find a single buried setting. The mental load is entirely on the user.</p>
              <div style={{marginTop: '28px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-lo)', marginBottom: '8px'}}>
                  <span style={{fontFamily: 'monospace'}}>Finding solution...</span>
                  <span style={{fontFamily: 'monospace', color: '#ff6b6b'}}>47 min elapsed</span>
                </div>
                <div style={{height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden'}}>
                  <div style={{height: '100%', width: '23%', background: 'linear-gradient(90deg, #ff6b6b, #ff4444)', borderRadius: '3px', position: 'relative'}}>
                    <div style={{position: 'absolute', right: 0, top: 0, height: '100%', width: '8px', background: 'rgba(255,255,255,0.4)', borderRadius: '0 3px 3px 0'}} />
                  </div>
                </div>
                <div style={{display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap'}}>
                  {['Reddit thread (2019)', 'YouTube — outdated', 'Samsung forum (deleted)', 'Stack Overflow — no answer'].map((src, i) => (
                    <span key={i} style={{padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through'}}>{src}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="beat" id="beat-8" style={{height: '100vh', position: 'relative'}}>
          <div className="container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%'}}>
            <h1 className="display" style={{color: 'var(--filament)'}}>Resolved.</h1>
          </div>
        </section>

        <section className="beat" id="beat-9" style={{height: '120vh', position: 'relative'}}>
          <div className="container" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', alignItems: 'flex-end'}}>
             <div className="glass-pane card" style={{maxWidth: '600px', padding: '48px', position: 'relative', overflow: 'hidden'}}>
               {/* Decorative background glow */}
               <div style={{position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(76, 215, 246, 0.15) 0%, transparent 70%)', filter: 'blur(20px)'}}></div>
               
               <div style={{fontSize: '12px', color: 'var(--text-hi)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                 <span style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 10px var(--success)'}}></span>
                 System Telemetry
               </div>
               
               <h2 className="h2" style={{marginBottom: '16px'}}>Enterprise-Grade Speed</h2>
               <p style={{color: 'var(--text-mid)', lineHeight: 1.6, marginBottom: '32px'}}>
                 Fixby doesn't rely entirely on slow, expensive LLM calls. A multi-tiered caching architecture intercepts known intents at the edge, resolving issues instantly and deterministically.
               </p>

               <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                 <div style={{padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
                   <div style={{fontSize: '13px', color: 'var(--text-lo)', marginBottom: '8px'}}>Vector Cache Latency</div>
                   <div style={{fontSize: '28px', fontWeight: 700, color: 'var(--text-hi)', display: 'flex', alignItems: 'baseline', gap: '4px'}}>
                     18 <span style={{fontSize: '14px', color: 'var(--text-lo)', fontWeight: 400}}>ms</span>
                   </div>
                 </div>
                 
                 <div style={{padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
                   <div style={{fontSize: '13px', color: 'var(--text-lo)', marginBottom: '8px'}}>Intent Accuracy</div>
                   <div style={{fontSize: '28px', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'baseline', gap: '4px'}}>
                     99.8 <span style={{fontSize: '14px', color: 'var(--success)', opacity: 0.8, fontWeight: 400}}>%</span>
                   </div>
                 </div>

                 <div style={{padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
                   <div style={{fontSize: '13px', color: 'var(--text-lo)', marginBottom: '8px'}}>Deep LLM Fallback</div>
                   <div style={{fontSize: '28px', fontWeight: 700, color: 'var(--text-hi)', display: 'flex', alignItems: 'baseline', gap: '4px'}}>
                     &lt; 10 <span style={{fontSize: '14px', color: 'var(--text-lo)', fontWeight: 400}}>%</span>
                   </div>
                 </div>

                 <div style={{padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
                   <div style={{fontSize: '13px', color: 'var(--text-lo)', marginBottom: '8px'}}>SHKG Leaf Nodes</div>
                   <div style={{fontSize: '28px', fontWeight: 700, color: 'var(--trace)', display: 'flex', alignItems: 'baseline', gap: '4px'}}>
                     14.2 <span style={{fontSize: '14px', color: 'var(--trace)', opacity: 0.8, fontWeight: 400}}>k</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </section>

        <section className="beat" id="beat-10" style={{height: '100vh', position: 'relative', overflow: 'hidden'}}>
          {/* Strong centre vignette so phone reads as background */}
          <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 65% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%)', pointerEvents: 'none', zIndex: 1}} />
          
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', gap: '0',
          }}>
            {/* Frosted glass text backdrop — no border, invisible but legible */}
            <div style={{
              padding: '48px 64px',
              borderRadius: '32px',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              background: 'rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0',
            }}>
            {/* Eyebrow */}
            <p style={{
              fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginBottom: '20px',
            }}>Live diagnostic engine</p>

            {/* Giant headline */}
            <h2 style={{
              fontSize: 'clamp(4rem, 10vw, 8rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: '#fff',
              margin: 0,
              position: 'relative',
              display: 'inline-block',
            }}>
              Try it.
              {/* Glowing animated underline */}
              <span style={{
                position: 'absolute',
                bottom: '-8px', left: 0, right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #4c8dff, #a78bfa, #4c8dff, transparent)',
                backgroundSize: '200% 100%',
                borderRadius: '2px',
                animation: 'shimmer 2.5s linear infinite',
              }} />
            </h2>

            {/* Sub-text */}
            <p style={{
              marginTop: '36px',
              fontSize: '1.15rem',
              color: 'rgba(255,255,255,0.45)',
              maxWidth: '32ch',
              lineHeight: 1.6,
            }}>
              Plain language in. Exact settings path out.<br/>No links invented. No menus to hunt.
            </p>

            {/* Ghost-border CTA */}
            <button
              onClick={onEnterConsole}
              style={{
                marginTop: '48px',
                padding: '16px 44px',
                borderRadius: '100px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                letterSpacing: '0.02em',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.08)';
                el.style.borderColor = 'rgba(255,255,255,0.5)';
                el.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.background = 'transparent';
                el.style.borderColor = 'rgba(255,255,255,0.25)';
                el.style.transform = 'scale(1)';
              }}
            >
              Enter Console →
            </button>
            </div>{/* end frosted glass wrapper */}
          </div>
        </section>
      </main>
    </>
  );
}
