-- CreateTable
CREATE TABLE "ValidationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "validatedData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
