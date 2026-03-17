-- CreateTable
CREATE TABLE "PrivacyPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effectiveDate" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "dataController" TEXT NOT NULL DEFAULT 'QR Code Helpline System',
    "contactEmail" TEXT NOT NULL DEFAULT 'privacy@qr-code-helpline.com',
    "retentionPeriods" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CookiePolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effectiveDate" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "cookieCategories" JSONB NOT NULL,
    "retentionPeriod" INTEGER NOT NULL DEFAULT 90,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DataProcessingAgreement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effectiveDate" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "dataController" TEXT NOT NULL DEFAULT 'QR Code Helpline System',
    "dataProcessor" TEXT NOT NULL DEFAULT 'QR Code Helpline System',
    "purposes" JSONB NOT NULL,
    "dataTypes" JSONB NOT NULL,
    "securityMeasures" JSONB NOT NULL,
    "subProcessors" JSONB NOT NULL,
    "retentionPeriod" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DataSubjectRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ConsentWithdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "consentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "withdrawnAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
