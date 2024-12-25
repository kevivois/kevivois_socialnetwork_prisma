/*
  Warnings:

  - You are about to drop the column `Description` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "Description",
ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "_UserInvitation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserInvitation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserInvitation_B_index" ON "_UserInvitation"("B");

-- AddForeignKey
ALTER TABLE "_UserInvitation" ADD CONSTRAINT "_UserInvitation_A_fkey" FOREIGN KEY ("A") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInvitation" ADD CONSTRAINT "_UserInvitation_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
