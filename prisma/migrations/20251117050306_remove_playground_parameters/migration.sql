/*
  Warnings:

  - You are about to drop the column `parameters` on the `playground_tests` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "playground_tests" DROP COLUMN "parameters";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "credits";
