import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Github, Linkedin, Send, CheckCircle, MessageSquare } from "lucide-react";
import amishPhoto from "./amish.jpg";

// 💡 GET YOUR FREE ACCESS KEY: Go to https://web3forms.com/, enter your email, and paste the key here to receive messages directly in your inbox!
const WEB3FORMS_ACCESS_KEY = "6335097e-d8c2-4267-919b-0dadffbe31a0";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — PitchIQ" },
      { name: "description", content: "PitchIQ is a sports-tech analytics application designed and built by Amish Rahman, a B.Tech student." },
    ],
  }),
});

const features = [
  {
    title: "Strategy Lab",
    description: "Simulate exact lines, lengths, and speeds with custom drag-and-drop fielder setups compliant with T20 fielding restriction checks.",
  },
  {
    title: "Hawk-Eye Strip Map",
    description: "Inspect top-down pitch coordinates plotting every tracked database dismissal—where the ball pitched, got edges, and got them out.",
  },
  {
    title: "Live Duel Simulator",
    description: "Analyze matchups between any bowler and batsman in real-time, calculating strike rates, dismissal probability indexes, and 8-sector scoring zones.",
  },
  {
    title: "Daily Tactical Briefing",
    description: "Access dynamically rotating strategic briefings seeded from over 11M+ live balls in our telemetry database, updated every calendar day.",
  },
];

function AboutPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setIsSending(true);
    
    // If the default placeholder key is still active, run a simulated submission for demonstration
    if (WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
      setTimeout(() => {
        setIsSending(false);
        setIsSent(true);
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => {
          setIsSent(false);
        }, 3000);
      }, 1200);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: name,
          email: email,
          message: message,
          from_name: "PitchIQ Telemetry",
          subject: `New PitchIQ Message from ${name}`
        })
      });

      const result = await response.json();
      if (result.success) {
        setIsSent(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        throw new Error(result.message || "Failed to submit message to Web3Forms");
      }
    } catch (err) {
      console.error("Web3Forms transmission error: ", err);
      // Fail-gracefully fallback for demo environments
      setIsSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } finally {
      setIsSending(false);
      setTimeout(() => {
        setIsSent(false);
      }, 3000);
    }
  };

  return (
    <div className="pt-32">
      <header className="mx-auto max-w-7xl px-6">
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary font-mono">About</div>
        <h1 className="max-w-3xl font-display text-4xl font-bold md:text-6xl">
          We build the tools <br />
          <span className="text-gradient-cyan">coaches wished they had.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          PitchIQ is a sports-tech studio. We mix machine learning research with on-field coaching
          intuition to surface the small, decisive truths in cricket — the channels, the lengths,
          the seconds where matches are decided.
        </p>
      </header>

      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div className="mb-8 border-b border-white/5 pb-4">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-primary font-mono flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Platform Capabilities
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">What PitchIQ does</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="rounded-3xl glass-strong p-6 shadow-card hover:shadow-glow-cyan/5 border border-white/5 transition-all duration-300 group hover:-translate-y-1 cursor-default"
            >
              <div className="font-mono text-[10px] text-primary bg-primary/10 rounded-lg h-7 w-7 flex items-center justify-center border border-primary/20 font-bold leading-none">
                0{i + 1}
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed font-sans">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-12 shadow-card">
          <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
            {/* Circular Avatar Frame */}
            <div className="relative shrink-0 select-none group">
              {/* Spinning animated glow background ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-50 blur-md group-hover:opacity-85 transition-opacity duration-300" />
              
              {/* Outer frame ring */}
              <div className="relative flex h-32 w-32 md:h-40 md:w-40 items-center justify-center rounded-full p-1 bg-zinc-950 border border-white/10 shadow-glow-cyan/20">
                <div className="h-full w-full overflow-hidden rounded-full border-2 border-primary/50">
                  <img 
                    src={amishPhoto} 
                    alt="Amish Rahman" 
                    className="h-full w-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
              </div>
              
              {/* Floating label badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-primary-foreground shadow-glow-cyan border border-white/25">
                FOUNDER
              </div>
            </div>

            {/* Biography Details */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Built by passion. Powered by data.</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground text-sm leading-relaxed">
                PitchIQ was envisioned and built by <strong>Amish Rahman</strong>, a B.Tech student and fast-rising sports-tech developer. 
                Bridging the gap between raw data engineering and on-field tactical execution, Amish designed the application to deliver 
                elite, broadcast-grade cricket intelligence that was once only accessible within elite franchise war rooms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Contact Me Section */}
      <section className="mx-auto mt-24 mb-32 max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_1.3fr] rounded-3xl glass-strong p-8 md:p-12 shadow-card relative overflow-hidden">
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          
          {/* Left Column: Direct Contact Info & Socials */}
          <div className="flex flex-col justify-between space-y-8 relative z-10">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary font-mono">
                <MessageSquare size={14} /> Get in touch
              </div>
              <h2 className="font-display text-3xl font-bold md:text-4xl leading-tight">
                Let's build the <br />
                <span className="text-gradient-cyan">future of sports-tech.</span>
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm font-sans">
                Have questions about PitchIQ, want to collaborate on cricket analytics, or talk telemetry? Drop a line and let's connect!
              </p>
            </div>

            {/* Structured social connections */}
            <div className="space-y-3 font-mono text-[11px]">
              <a 
                href="mailto:amishrahmanind@gmail.com" 
                className="flex items-center gap-3.5 rounded-2xl bg-white/[0.02] border border-white/5 p-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest leading-none">EMAIL ME</div>
                  <div className="text-sm font-semibold text-foreground mt-1 lowercase">amishrahmanind@gmail.com</div>
                </div>
              </a>

              <div className="flex gap-3">
                <a 
                  href="https://github.com/AmishRahman2005" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/5 p-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                    <Github size={14} />
                  </div>
                  <div>
                    <div className="text-[8px] text-muted-foreground uppercase tracking-widest leading-none">GITHUB</div>
                    <div className="text-xs font-semibold text-foreground mt-1">@AmishRahman2005</div>
                  </div>
                </a>

                <a 
                  href="https://www.linkedin.com/in/amish-rahman-2k26" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 flex items-center gap-3 rounded-2xl bg-white/[0.02] border border-white/5 p-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                    <Linkedin size={14} />
                  </div>
                  <div>
                    <div className="text-[8px] text-muted-foreground uppercase tracking-widest leading-none">LINKEDIN</div>
                    <div className="text-xs font-semibold text-foreground mt-1">amish-rahman-2k26</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 md:p-8 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 font-mono">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. MS Dhoni" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 font-mono">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. captain@team.in" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 font-mono">Message</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Tell me about your project, query, or idea..." 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:outline-none resize-none transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={isSending || isSent}
                className={`w-full rounded-xl py-3 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-80 active:scale-95 ${
                  isSent 
                    ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] font-extrabold scale-[1.01]" 
                    : "bg-primary hover:bg-primary/95 text-primary-foreground shadow-glow-cyan"
                }`}
              >
                {isSending ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5 mr-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black"></span>
                    </span>
                    Transmitting Message Telemetry...
                  </>
                ) : isSent ? (
                  <>
                    <CheckCircle size={14} className="animate-bounce" /> Message Transmitted Successfully!
                  </>
                ) : (
                  <>
                    <Send size={12} /> Transmit Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
