-- CreateTable
CREATE TABLE "RateLimitViolation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "maxRequests" INTEGER NOT NULL,
    "windowMs" INTEGER NOT NULL,
    "resetTime" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
