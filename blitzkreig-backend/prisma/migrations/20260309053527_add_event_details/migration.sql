-- AlterTable
ALTER TABLE "events" ADD COLUMN     "brochure_url" VARCHAR(500),
ADD COLUMN     "chess_results_url" VARCHAR(500),
ADD COLUMN     "gallery" JSONB,
ADD COLUMN     "participants_count" INTEGER,
ADD COLUMN     "prize_fund" INTEGER,
ADD COLUMN     "winners" JSONB;
