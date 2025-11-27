"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Breadcrumbs, Button } from "@/components/ui";
import { SuitIcon } from "@/components/svg";
import { CardFace } from "@/components/game/CardFace";

const tutorialSteps = [
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
];

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <header className="mb-6">
        <Breadcrumbs
          items={[
            { label: "Tutorial" },
          ]}
        />
      </header>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto w-full mb-8">
        <div className="flex items-center gap-2 mb-2">
          {tutorialSteps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= currentStep ? "bg-gold" : "bg-text-muted/20"
              }`}
              initial={false}
              animate={{
                backgroundColor:
                  index <= currentStep
                    ? "var(--gold)"
                    : "rgba(107, 107, 123, 0.2)",
              }}
            />
          ))}
        </div>
        <div className="text-center text-xs text-text-muted">
          Step {currentStep + 1} of {tutorialSteps.length}
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
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                {step.title}
              </h2>

              {/* Visual component */}
              <div className="mb-6 flex justify-center">
                <TutorialVisual type={step.visual} />
              </div>

              {/* Content text */}
              <p className="text-white font-bold text-center whitespace-pre-line leading-relaxed">
                {step.content}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep === tutorialSteps.length - 1 ? (
              <Link href="/">
                <Button variant="primary">Start Playing</Button>
              </Link>
            ) : (
              <Button variant="primary" onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function TutorialVisual({ type }: { type: string }) {
  switch (type) {
    case "intro":
      return (
        <div className="flex gap-2">
          {(["spades", "hearts", "diamonds", "clubs"] as const).map((suit) => (
            <motion.div
              key={suit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * ["spades", "hearts", "diamonds", "clubs"].indexOf(suit) }}
            >
              <SuitIcon suit={suit} size={40} />
            </motion.div>
          ))}
        </div>
      );

    case "teams":
      return (
        <div className="relative w-48 h-48">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-dark flex items-center justify-center text-gold border border-gold/50">
              N
            </div>
            <div className="text-xs text-white font-bold mt-1">Partner</div>
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-center">
            <div className="w-12 h-12 rounded-full bg-midnight flex items-center justify-center text-text-muted border border-text-muted/30">
              W
            </div>
            <div className="text-xs text-white font-bold mt-1">Opponent</div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
            <div className="w-12 h-12 rounded-full bg-midnight flex items-center justify-center text-text-muted border border-text-muted/30">
              E
            </div>
            <div className="text-xs text-white font-bold mt-1">Opponent</div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-dark flex items-center justify-center text-gold border border-gold/50">
              S
            </div>
            <div className="text-xs text-white font-bold mt-1">You</div>
          </div>
        </div>
      );

    case "bidding":
      return (
        <div className="flex items-center gap-4">
          <div style={{ width: 60, height: 84 }}>
            <CardFace suit="spades" rank="A" width={60} height={84} />
          </div>
          <div className="text-4xl text-gold font-mono" style={{ fontFamily: "var(--font-fira-code)" }}>
            ?
          </div>
          <div className="text-white font-bold">= How many tricks?</div>
        </div>
      );

    case "playing":
      return (
        <div className="flex gap-2">
          <div style={{ width: 50, height: 70 }}>
            <CardFace suit="hearts" rank="7" width={50} height={70} />
          </div>
          <div style={{ width: 50, height: 70 }}>
            <CardFace suit="hearts" rank="K" width={50} height={70} />
          </div>
          <div style={{ width: 50, height: 70 }}>
            <CardFace suit="hearts" rank="3" width={50} height={70} />
          </div>
          <div style={{ width: 50, height: 70 }}>
            <CardFace suit="spades" rank="2" width={50} height={70} />
          </div>
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
          <div className="flex items-center justify-center gap-4">
            <span className="text-white font-bold">Bid 4, Win 5 =</span>
            <span className="text-success font-mono text-xl" style={{ fontFamily: "var(--font-fira-code)" }}>
              +41
            </span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-white font-bold">Bid 4, Win 3 =</span>
            <span className="text-danger font-mono text-xl" style={{ fontFamily: "var(--font-fira-code)" }}>
              -40
            </span>
          </div>
        </div>
      );

    case "nil":
      return (
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold text-sm">Nil</span>
            <span className="text-white font-bold">0 tricks = +100/-100</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gold text-midnight text-sm">Blind Nil</span>
            <span className="text-white font-bold">+200/-200</span>
          </div>
        </div>
      );

    case "winning":
      return (
        <div className="text-center">
          <div
            className="text-5xl font-mono text-gold mb-2"
            style={{ fontFamily: "var(--font-fira-code)" }}
          >
            500
          </div>
          <div className="text-white font-bold">points to win</div>
        </div>
      );

    default:
      return null;
  }
}


