/*
  Warnings:

  - Added the required column `test` to the `WebPage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebPage" ADD COLUMN     "test" DECIMAL(65,30) NOT NULL;
