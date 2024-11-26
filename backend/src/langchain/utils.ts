import { Document } from "@langchain/core/documents";
import { BindToolsInput } from "@langchain/core/language_models/chat_models";
import { StructuredTool } from "@langchain/core/tools";
import { Annotation } from "@langchain/langgraph";
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export const formatDocumentsAsString = (documents: Document[]): string => {
  return documents.map((document) => document.pageContent).join("\n\n");
};

export const standardStringAnnotationReducer = () => {
  return Annotation<string>({ reducer: (a, b) => b, default: () => null, });
}

export const standardBooleanAnnotationReducer = () => {
  return Annotation<boolean>({ reducer: (a, b) => b, default: () => false, });
}

export type StructureToolOrBindToolsInput = StructuredTool | BindToolsInput;

export const zodSchemaToOpenAICompatibleTool = (functionName: string, schema: z.ZodType): BindToolsInput => {
  return {
    type: "function",
    name: functionName,
    function: {
      name: functionName,
      parameters: zodToJsonSchema(schema)
    }
  };
}