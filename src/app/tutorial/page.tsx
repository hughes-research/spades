"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Breadcrumbs, Button } from "@/components/ui";
import { SuitIcon } from "@/components/svg";
import { CardFace } from "@/components/game/CardFace";
import { FONTS } from "@/lib/styles";

const SUIT_ORDER = ["spades", "hearts", "diamonds", "clubs"] as const;

const TUTORIAL_STEPS = [
  {
    title: "Welcome to Spades",
    content: `Spades is a trick-taking card game played with a standard 52-card deck. 
    You'll partner with an AI teammate against two AI opponents. 
    The goal is to be the first team to reach 500 points!`,
    visual: "intro",
  },
  {
    title: "The Teams",
    content: `You (South) are partnered with North. You'll play against West and East.
    Partners sit across from each other at the table.
    Your team's tricks and scores are combined.`,
    visual: "teams",
  },
  {
    title: "Dealing & Bidding",
    content: `Each player receives 13 cards. Before playing, each player bids 
    how many tricks they think they'll win (0-13).
    Your team's combined bid is your target for the round.`,
    visual: "bidding",
  },
  {
    title: "Playing Tricks",
    content: `The player to the dealer's left leads the first trick.
    Players must follow the lead suit if possible.
    If you can't follow suit, you may play any card (including spades).`,
    visual: "playing",
  },
  {
    title: "Spades are Trump",
    content: `Spades are always the trump suit - they beat any other suit.
    The highest spade wins if any are played.
    You can't lead with spades until they're "broken" (played on another trick).`,
    visual: "trump",
  },
  {
    title: "Scoring",
    content: `Make your bid: 10 points per trick bid + 1 point per overtrick (bag).
    Fail your bid: Lose 10 points per trick bid.
    Warning: Every 10 bags costs you 100 points!`,
    visual: "scoring",
  },
  {
    title: "Nil Bids",
    content: `Nil: Bid 0 tricks. Success = +100 points, Failure = -100 points.
    Blind Nil: Bid 0 before seeing your cards. +200/-200 points.
    Your partner must cover for you if you bid nil!`,
    visual: "nil",
  },
  {
    title: "Winning the Game",
    content: `First team to 500 points wins!
    If both teams pass 500 in the same round, the higher score wins.
    Good luck and have fun!`,
    visual: "winning",
  },
] as const;

function TeamPosition({ label, isPartner, position }: { 
  label: string; 
  isPartner: boolean; 
  position: string;
}) {
  const positionStyles: Record<string, string> = {
    top: "absolute top-0 left-1/2 -translate-x-1/2",
    left: "absolute left-0 top-1/2 -translate-y-1/2",
    right: "absolute right-0 top-1/2 -translate-y-1/2",
    bottom: "absolute bottom-0 left-1/2 -translate-x-1/2",
  };
  
  return (
    <div className={`${positionStyles[position]} text-center`}>
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center border
        ${isPartner 
          ? "bg-indigo-dark text-gold border-gold/50" 
          : "bg-midnight text-text-muted border-text-muted/30"
        }
      `}>
        {label}
      </div>
      <div className="text-xs text-white font-bold mt-1">
        {position === "bottom" ? "You" : isPartner ? "Partner" : "Opponent"}
      </div>
    </div>
  );
}

function TutorialVisual({ type }: { type: string }) {
  switch (type) {
    case "intro":
      return (
        <div className="flex gap-2">
          {SUIT_ORDER.map((suit, i) => (
            <motion.div
              key={suit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <SuitIcon suit={suit} size={40} />
            </motion.div>
          ))}
        </div>
      );

    case "teams":
      return (
        <div className="relative w-48 h-48">
          <TeamPosition label="N" isPartner position="top" />
          <TeamPosition label="W" isPartner={false} position="left" />
          <TeamPosition label="E" isPartner={false} position="right" />
          <TeamPosition label="S" isPartner position="bottom" />
        </div>
      );

    case "bidding":
      return (
        <div className="flex items-center gap-4">
          <div style={{ width: 60, height: 84 }}>
            <CardFace suit="spades" rank="A" width={60} height={84} />
          </div>
          <div className="text-4xl text-gold font-mono" style={{ fontFamily: FONTS.mono }}>?</div>
          <div className="text-white font-bold">= How many tricks?</div>
        </div>
      );

    case "playing":
      return (
        <div className="flex gap-2">
          {[
            { suit: "hearts" as const, rank: "7" as const },
            { suit: "hearts" as const, rank: "K" as const },
            { suit: "hearts" as const, rank: "3" as const },
            { suit: "spades" as const, rank: "2" as const },
          ].map((card, i) => (
            <div key={i} style={{ width: 50, height: 70 }}>
              <CardFace suit={card.suit} rank={card.rank} width={50} height={70} />
            </div>
          ))}
        </div>
      );

    case "trump":
      return (
        <div className="flex items-center gap-4">
          <div style={{ width: 60, height: 84 }}>
            <CardFace suit="hearts" rank="A" width={60} height={84} />
          </div>
          <span className="text-2xl text-white font-bold">&lt;</span>
          <div style={{ width: 60, height: 84 }}>
            <CardFace suit="spades" rank="2" width={60} height={84} />
          </div>
        </div>
      );

    case "scoring":
      return (
        <div className="text-center space-y-2">
          {[
            { text: "Bid 4, Win 5 =", value: "+41", color: "text-success" },
            { text: "Bid 4, Win 3 =", value: "-40", color: "text-danger" },
          ].map(({ text, value, color }) => (
            <div key={text} className="flex items-center justify-center gap-4">
              <span className="text-white font-bold">{text}</span>
              <span className={`font-mono text-xl ${color}`} style={{ fontFamily: FONTS.mono }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      );

    case "nil":
      return (
        <div className="space-y-3 text-center">
          {[
            { label: "Nil", bg: "bg-gold/20", text: "text-gold", desc: "0 tricks = +100/-100" },
            { label: "Blind Nil", bg: "bg-gold", text: "text-midnight", desc: "+200/-200" },
          ].map(({ label, bg, text, desc }) => (
            <div key={label} className="flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-full ${bg} ${text} text-sm`}>{label}</span>
              <span className="text-white font-bold">{desc}</span>
            </div>
          ))}
        </div>
      );

    case "winning":
      return (
        <div className="text-center">
          <div className="text-5xl font-mono text-gold mb-2" style={{ fontFamily: FONTS.mono }}>
            500
          </div>
          <div className="text-white font-bold">points to win</div>
        </div>
      );

    default:
      return null;
  }
}

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="min-h-screen flex flex-col p-4">
      <header className="mb-6">
        <Breadcrumbs items={[{ label: "Tutorial" }]} />
      </header>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div className="flex items-center gap-2 mb-2">
          {TUTORIAL_STEPS.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1 flex-1 rounded-full ${index <= currentStep ? "bg-gold" : "bg-text-muted/20"}`}
              initial={false}
              animate={{
                backgroundColor: index <= currentStep ? "var(--gold)" : "rgba(107, 107, 123, 0.2)",
              }}
            />
          ))}
        </div>
        <div className="text-center text-xs text-text-muted">
          Step {currentStep + 1} of {TUTORIAL_STEPS.length}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              className="glass-panel p-8 rounded-2xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="text-2xl text-gold font-display mb-4 text-center tracking-wider"
                style={{ fontFamily: FONTS.display }}
              >
                {step.title}
              </h2>
              <div className="mb-6 flex justify-center">
                <TutorialVisual type={step.visual} />
              </div>
              <p className="text-white font-bold text-center whitespace-pre-line leading-relaxed">
                {step.content}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            {isLastStep ? (
              <Link href="/">
                <Button variant="primary">Start Playing</Button>
              </Link>
            ) : (
              <Button
                variant="primary"
                onClick={() => setCurrentStep((s) => s + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
