-- AlterTable
ALTER TABLE "Client" ADD COLUMN "lastService" DATETIME;
ALTER TABLE "Client" ADD COLUMN "poolSize" TEXT;
ALTER TABLE "Client" ADD COLUMN "poolState" TEXT;
ALTER TABLE "Client" ADD COLUMN "poolType" TEXT;
ALTER TABLE "Client" ADD COLUMN "serviceFrequency" TEXT;
