"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/icon";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

function useInViewKey() {
  const ref = useRef<HTMLHeadingElement>(null);
  const [animKey, setKey] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setKey((k) => k + 1);
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, animKey };
}

function Hero() {
  const { ref, animKey } = useInViewKey();
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "64px 24px 144px",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "var(--gradient-hero)",
        }}
      />
      <div style={{ position: "relative", margin: "0 auto", maxWidth: 1024 }}>
        <div
          style={{
            margin: "0 auto 32px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: "oklch(0.16 0.02 260 / 0.6)",
            backdropFilter: "blur(8px)",
            padding: "6px 16px",
            fontSize: 12,
            color: "var(--muted-foreground)",
          }}
        >
          <span
            style={{
              height: 6,
              width: 6,
              borderRadius: 999,
              background: "var(--primary)",
            }}
          />
          The agentic AI era is here
        </div>
        <h1
          ref={ref}
          style={{
            margin: "0 auto",
            maxWidth: 960,
            fontSize: "clamp(40px, 6vw, 76px)",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "var(--muted-foreground)",
          }}
        >
          The future of learning
          <br />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              verticalAlign: "middle",
            }}
          >
            is
          </span>{" "}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              verticalAlign: "middle",
              overflow: "hidden",
            }}
          >
            <Icon
              name="fingerprint"
              size={56}
              strokeWidth={1.5}
              style={{ color: "var(--primary)" }}
            />
            <span
              key={`h-${animKey}`}
              className="animate-rise-up"
              style={{ color: "var(--foreground)" }}
            >
              human
            </span>
          </span>{" "}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              verticalAlign: "middle",
              color: "var(--foreground)",
            }}
          >
            +
          </span>{" "}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              verticalAlign: "middle",
            }}
          >
            <Icon
              name="sparkles"
              size={56}
              strokeWidth={1.5}
              style={{ color: "var(--primary)" }}
            />
            <span
              key={`a-${animKey}`}
              className="animate-slide-in-from-right"
              style={{ color: "var(--foreground)" }}
            >
              agentic AI
            </span>
          </span>
        </h1>
        <p
          style={{
            margin: "32px auto 0",
            maxWidth: 640,
            fontSize: 18,
            color: "var(--muted-foreground)",
            lineHeight: 1.6,
          }}
        >
          Master the craft of communicating with AI. Practice real scenarios
          with an always-available coach, and ship the soft skills to real
          world.
        </p>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Link
            href="/practice"
            className="glow-border"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 8,
              background: "var(--primary)",
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--primary-foreground)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <span>Start Practicing</span> <Icon name="arrow-right" size={16} />
          </Link>
          <a
            href="#curriculum"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            Explore Curriculum
          </a>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  const logos = [
    "NORTHWIND",
    "ACME CORP",
    "HELIOS",
    "VANTAGE",
    "QUANTAGRID",
    "MERIDIAN",
  ];
  return (
    <section
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "40px 24px",
      }}
    >
      <p
        style={{
          margin: "0 0 24px",
          textAlign: "center",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--muted-foreground)",
        }}
      >
        Trusted by engineering teams at
      </p>
      <div
        style={{
          margin: "0 auto",
          maxWidth: 1024,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "16px 48px",
        }}
      >
        {logos.map((l) => (
          <span
            key={l}
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: "oklch(0.65 0.02 260 / 0.7)",
            }}
          >
            {l}
          </span>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 12,
        border: `1px solid ${hover ? "oklch(0.65 0.21 255 / 0.4)" : "var(--border)"}`,
        background: "var(--card)",
        padding: 28,
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 44,
          width: 44,
          borderRadius: 8,
          background: "oklch(0.65 0.21 255 / 0.1)",
          color: "var(--primary)",
        }}
      >
        <Icon name={icon} size={20} />
      </div>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 18,
          fontWeight: 600,
          color: "var(--foreground)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}
      >
        {desc}
      </p>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: "message-square",
      title: "Conversation practice",
      desc: "Real-world scenarios — design briefs, code reviews, customer comms — practiced with an AI partner that never tires.",
    },
    {
      icon: "graduation-cap",
      title: "Skill mapping for AI-native teams",
      desc: "Benchmark every member against the agentic communication skill graph and surface gaps before they slow you down.",
    },
    {
      icon: "shield-check",
      title: "Evals & feedback",
      desc: "Standardized rubrics for prompting, framing, and follow-ups. Promote skills with confidence.",
    },
    {
      icon: "workflow",
      title: "Enterprise analytics",
      desc: "Cohort dashboards, role readiness, and progress signals piped into your HRIS and skills system.",
    },
  ];
  return (
    <section style={{ padding: "128px 24px" }}>
      <div style={{ margin: "0 auto", maxWidth: 1152 }}>
        <div style={{ marginBottom: 56, maxWidth: 640 }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--primary)",
            }}
          >
            Platform
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "var(--foreground)",
            }}
          >
            Everything your team needs to communicate fluently with AI.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          }}
        >
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              desc={f.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CurriculumCard({
  t,
}: {
  t: {
    icon: string;
    title: string;
    level: string;
    modules: number;
    desc: string;
  };
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "var(--secondary)" : "var(--card)",
        padding: 28,
        transition: "background 0.2s",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 40,
            width: 40,
            borderRadius: 8,
            background: "oklch(0.65 0.21 255 / 0.1)",
            color: "var(--primary)",
          }}
        >
          <Icon name={t.icon} size={18} />
        </div>
        <span
          style={{
            borderRadius: 999,
            border: "1px solid var(--border)",
            padding: "2px 10px",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--muted-foreground)",
          }}
        >
          {t.level}
        </span>
      </div>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 16,
          fontWeight: 600,
          color: "var(--foreground)",
        }}
      >
        {t.title}
      </h3>
      <p
        style={{
          margin: "0 0 20px",
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--muted-foreground)",
        }}
      >
        {t.desc}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--muted-foreground)",
        }}
      >
        <span>{t.modules} modules</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            color: "var(--primary)",
          }}
        >
          View track <Icon name="arrow-right" size={12} />
        </span>
      </div>
    </div>
  );
}

function Curriculum() {
  const tracks = [
    {
      icon: "sparkles",
      title: "Foundations of prompting",
      level: "Core",
      modules: 8,
      desc: "How LLMs read, what context windows really mean, and the anatomy of a great prompt.",
    },
    {
      icon: "message-square",
      title: "Framing & intent",
      level: "Core",
      modules: 6,
      desc: "Stating goals, constraints, and acceptance criteria so models stay on the rails.",
    },
    {
      icon: "database",
      title: "Working with knowledge",
      level: "Intermediate",
      modules: 7,
      desc: "Pasting context, citing sources, and getting grounded answers you can verify.",
    },
    {
      icon: "bot",
      title: "Conversational repair",
      level: "Intermediate",
      modules: 5,
      desc: "Recovering from drift, recalibrating, and steering long sessions back to the goal.",
    },
    {
      icon: "shield-check",
      title: "Evals & safety",
      level: "Intermediate",
      modules: 5,
      desc: "Spotting hallucinations, structuring follow-ups, and guarding sensitive flows.",
    },
    {
      icon: "rocket",
      title: "Production conversations",
      level: "Advanced",
      modules: 8,
      desc: "Patterns for code reviews, customer support, and design crit at production scale.",
    },
  ];
  return (
    <section id="curriculum" style={{ padding: "128px 24px" }}>
      <div style={{ margin: "0 auto", maxWidth: 1152 }}>
        <div
          style={{
            marginBottom: 56,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--primary)",
              }}
            >
              Curriculum
            </p>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Learning paths from first prompt to production conversations.
            </h2>
          </div>
          <p
            style={{
              maxWidth: 360,
              fontSize: 14,
              color: "var(--muted-foreground)",
            }}
          >
            Six tracks, 40+ hands-on situations, calibrated for builders, leads,
            and platform teams.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gap: 1,
            overflow: "hidden",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--border)",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {tracks.map((t) => (
            <CurriculumCard key={t.title} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section style={{ padding: "128px 24px" }}>
      <div
        style={{
          position: "relative",
          margin: "0 auto",
          maxWidth: 1024,
          overflow: "hidden",
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--card)",
          padding: "96px 64px",
          textAlign: "center",
          backgroundImage: "var(--gradient-hero)",
        }}
      >
        <h2
          style={{
            margin: "0 auto",
            maxWidth: 640,
            fontSize: "clamp(28px, 4vw, 48px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          Train the way your team will actually work.
        </h2>
        <p
          style={{
            margin: "20px auto 0",
            maxWidth: 540,
            fontSize: 16,
            color: "var(--muted-foreground)",
          }}
        >
          Practice the awkward standup, the fuzzy spec, the tough customer email
          — with an AI coach that meets you where you are.
        </p>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Link
            href="/practice"
            className="glow-border"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 8,
              background: "var(--primary)",
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--primary-foreground)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <span>Start Practicing</span> <Icon name="arrow-right" size={16} />
          </Link>
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              padding: "14px 28px",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            Download Overview
          </a>
        </div>
      </div>
    </section>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "var(--background)",
  color: "var(--foreground)",
};

export default function LandingPage() {
  return (
    <main style={mainStyle}>
      <Nav current="home" />
      <Hero />
      <LogoStrip />
      <Features />
      <Curriculum />
      <CtaBand />
      <Footer />
    </main>
  );
}
