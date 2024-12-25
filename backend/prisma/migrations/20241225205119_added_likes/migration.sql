-- CreateTable
CREATE TABLE "_UserLikePostRelation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserLikePostRelation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserLikePostRelation_B_index" ON "_UserLikePostRelation"("B");

-- AddForeignKey
ALTER TABLE "_UserLikePostRelation" ADD CONSTRAINT "_UserLikePostRelation_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserLikePostRelation" ADD CONSTRAINT "_UserLikePostRelation_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
