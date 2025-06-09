/*
  Warnings:

  - You are about to drop the `professional_days` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professionals` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "professional_days";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "professionals";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "profissionals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "image" TEXT,
    "specialty" TEXT,
    "clinicId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "profissionals_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "profissional_days" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    CONSTRAINT "profissional_days_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "profissionals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "profissionals_email_key" ON "profissionals"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profissionals_crm_key" ON "profissionals"("crm");
