"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Breadcrumbs, Button } from "@/components/ui";

interface Settings {
  difficulty: "easy" | "medium" | "hard";
  animationSpeed: "slow" | "normal" | "fast";
  showTutorial: boolean;
}

const defaultSettings: Settings = {
  difficulty: "medium",
  animationSpeed: "normal",
  showTutorial: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        } else {
          setError("Failed to load settings. Using defaults.");
        }
      } catch (err) {
        console.error("Settings fetch error:", err);
        setError("Network error. Using defaults.");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        throw new Error("Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Settings save error:", err);
      setSaveError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <header className="mb-6">
        <Breadcrumbs items={[{ label: "Settings" }]} />
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full">
        <motion.h1
          className="text-3xl text-gold font-display text-center mb-8 tracking-wider"
          style={{ fontFamily: "var(--font-cinzel)" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          SETTINGS
        </motion.h1>

        {/* Error messages */}
        {(error || saveError) && (
          <motion.div
            className="mb-4 p-3 rounded-lg bg-danger/20 border border-danger/50 text-white text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error || saveError}
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-8 text-text-muted">Loading...</div>
        ) : (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Default Difficulty */}
            <SettingsSection title="Default Difficulty">
              <div className="flex gap-2">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <button
                    key={level}
                    className={`
                      flex-1 py-3 px-4 rounded-lg border text-sm font-medium capitalize transition-all
                      ${
                        settings.difficulty === level
                          ? "bg-gold text-midnight border-gold"
                          : "border-text-muted/30 text-white hover:border-gold/50"
                      }
                    `}
                    onClick={() => handleChange("difficulty", level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white mt-2">
                The AI difficulty level for new games
              </p>
            </SettingsSection>

            {/* Animation Speed */}
            <SettingsSection title="Animation Speed">
              <div className="flex gap-2">
                {(["slow", "normal", "fast"] as const).map((speed) => (
                  <button
                    key={speed}
                    className={`
                      flex-1 py-3 px-4 rounded-lg border text-sm font-medium capitalize transition-all
                      ${
                        settings.animationSpeed === speed
                          ? "bg-gold text-midnight border-gold"
                          : "border-text-muted/30 text-white hover:border-gold/50"
                      }
                    `}
                    onClick={() => handleChange("animationSpeed", speed)}
                  >
                    {speed}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white mt-2">
                Controls card dealing and play animation speed
              </p>
            </SettingsSection>

            {/* Show Tutorial */}
            <SettingsSection title="Tutorial">
              <button
                className={`
                  w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all
                  flex items-center justify-between
                  ${
                    settings.showTutorial
                      ? "bg-indigo-dark/40 border-gold/50 text-white"
                      : "border-text-muted/30 text-white"
                  }
                `}
                onClick={() => handleChange("showTutorial", !settings.showTutorial)}
              >
                <span>Show tutorial for new players</span>
                <div
                  className={`
                    w-10 h-6 rounded-full relative transition-colors
                    ${settings.showTutorial ? "bg-gold" : "bg-text-muted/30"}
                  `}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                    animate={{
                      left: settings.showTutorial ? "calc(100% - 20px)" : "4px",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
            </SettingsSection>

            {/* Game Rules Info */}
            <SettingsSection title="Game Rules">
              <div className="space-y-2 text-sm text-white">
                <div className="flex justify-between">
                  <span>Win condition</span>
                  <span className="text-gold font-mono" style={{ fontFamily: "var(--font-fira-code)" }}>
                    500 points
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nil bonus/penalty</span>
                  <span className="font-mono" style={{ fontFamily: "var(--font-fira-code)" }}>
                    +100 / -100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Blind Nil bonus/penalty</span>
                  <span className="font-mono" style={{ fontFamily: "var(--font-fira-code)" }}>
                    +200 / -200
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bag penalty</span>
                  <span className="font-mono" style={{ fontFamily: "var(--font-fira-code)" }}>
                    -100 per 10 bags
                  </span>
                </div>
              </div>
            </SettingsSection>

            {/* Save Button */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleSave}
                isLoading={saving}
              >
                {saved ? "Saved!" : "Save Settings"}
              </Button>
            </motion.div>

            {/* Back link */}
            <div className="text-center">
              <Link href="/">
                <Button variant="ghost">Back to Menu</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel p-4 rounded-xl">
      <h2
        className="text-sm text-gold font-display mb-3 tracking-wider"
        style={{ fontFamily: "var(--font-cinzel)" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}


