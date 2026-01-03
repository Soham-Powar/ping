-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "image_url" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
