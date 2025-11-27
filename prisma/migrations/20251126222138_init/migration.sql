-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "yourTeamScore" INTEGER NOT NULL DEFAULT 0,
    "aiTeamScore" INTEGER NOT NULL DEFAULT 0,
    "yourTeamBags" INTEGER NOT NULL DEFAULT 0,
    "aiTeamBags" INTEGER NOT NULL DEFAULT 0,
    "winner" TEXT,
    "currentRound" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "yourBid" INTEGER NOT NULL,
    "partnerBid" INTEGER NOT NULL,
    "opponent1Bid" INTEGER NOT NULL,
    "opponent2Bid" INTEGER NOT NULL,
    "yourTricks" INTEGER NOT NULL DEFAULT 0,
    "partnerTricks" INTEGER NOT NULL DEFAULT 0,
    "opponent1Tricks" INTEGER NOT NULL DEFAULT 0,
    "opponent2Tricks" INTEGER NOT NULL DEFAULT 0,
    "yourTeamScore" INTEGER NOT NULL DEFAULT 0,
    "aiTeamScore" INTEGER NOT NULL DEFAULT 0,
    "yourTeamBags" INTEGER NOT NULL DEFAULT 0,
    "aiTeamBags" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Round_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "animationSpeed" TEXT NOT NULL DEFAULT 'normal',
    "showTutorial" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "gamesLost" INTEGER NOT NULL DEFAULT 0,
    "totalRounds" INTEGER NOT NULL DEFAULT 0,
    "highScore" INTEGER NOT NULL DEFAULT 0,
    "winStreak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "Round_gameId_roundNumber_key" ON "Round"("gameId", "roundNumber");
