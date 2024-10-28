import { Document } from "@langchain/core/documents";

export const formatDocumentsAsString = (documents: Document[]): string => {
  return documents.map((document) => document.pageContent).join("\n\n");
};