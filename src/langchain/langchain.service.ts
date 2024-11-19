import { ToolCall } from '@langchain/core/dist/messages/tool';
import { InputValues } from '@langchain/core/dist/utils/types';
import { AIMessage, BaseMessage, ToolMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { merge } from "lodash";
import { ensureEnv } from 'src/utils/ensure-env';
import { infer as zodInfer, ZodType } from 'zod';
import { StructureToolOrBindToolsInput, zodSchemaToOpenAICompatibleTool } from './utils';

const StructuredOutputToolName = "structured_output";

type FullInvocationOutput<OutputSchema extends ZodType> = { responseMessage: BaseMessage, stringResponse?: string, structuredResponse?: zodInfer<OutputSchema> };

@Injectable()
export class LangchainService implements OnModuleInit {
  private logger = new Logger("Langchain");

  private _openAIAPIKey: string;
  private _tavilyAPIKey: string;

  onModuleInit() {
    this.logger.log("Langchain service is starting");

    this._openAIAPIKey = ensureEnv("OPEN_AI_API_KEY");
    this._tavilyAPIKey = ensureEnv("TAVILY_API_KEY");
  }

  public get openAIAPIKey() { return this._openAIAPIKey }
  public get tavilyAPIKey() { return this._tavilyAPIKey }

  public getModel(temperature = 0): ChatOpenAI {
    return new ChatOpenAI({ apiKey: this._openAIAPIKey, model: 'gpt-4o-2024-08-06', temperature });
  }

  /**
   * Invokes a runnable (eg: model or piped message template) and subsequent tool calls until
   * all tool calls have been fulfilled.
   */
  public async fullyInvoke<RunInput extends InputValues = any, OutputSchema extends ZodType = any>(prompt: ChatPromptTemplate<RunInput>, invocationParams: RunInput, tools: StructuredTool[], structuredOutput?: OutputSchema): Promise<FullInvocationOutput<OutputSchema>>;
  public async fullyInvoke<RunInput extends InputValues = any, OutputSchema extends ZodType = any>(prompt: ChatPromptTemplate<RunInput>, invocationParams: RunInput, tools: StructuredTool[] = [], structuredOutput?: OutputSchema): Promise<FullInvocationOutput<any>> {
    const allTools: StructureToolOrBindToolsInput[] = tools; // can be an empty array

    // If the output is structured, add it as a tool, this is the recommended way to mix tools and structured output.
    if (structuredOutput)
      allTools.push(zodSchemaToOpenAICompatibleTool(StructuredOutputToolName, structuredOutput));

    const model = this.getModel().bindTools(allTools);

    const messageHistory: BaseMessage[] = await prompt.formatMessages(invocationParams);
    let responseMessage: AIMessage;
    let structuredResponse: zodInfer<OutputSchema>;
    while (true) {
      responseMessage = await model.invoke(messageHistory); // TODO: not always an AIMessage

      // Save this preliminary/final message to history
      messageHistory.push(responseMessage);

      const { executedToolsCount, structuredOutputToolCall, toolResponses } = await this.executeToolCalls(allTools, responseMessage.tool_calls);

      if (executedToolsCount === 0)
        break;

      structuredResponse = structuredOutputToolCall?.args;
      messageHistory.push(...toolResponses);
    }

    return { responseMessage, structuredResponse }
  }

  /**
   * Invokes all StructuredTool tools returned by a graph execution result. 
   * Structured output tool is not executed
   */
  private async executeToolCalls(tools: StructureToolOrBindToolsInput[], messagesOrToolCalls: BaseMessage[] | ToolCall[]) {
    if (!messagesOrToolCalls || messagesOrToolCalls.length === 0)
      return { executedToolsCount: 0, toolResponses: [] };

    // Only keep tools that we can invoke, not simple open ai tool definition (normally used for structured outputs only)
    const callableTools: StructuredTool[] = tools.filter(t => t instanceof StructuredTool);

    let toolCalls: ToolCall[] = [];
    if (messagesOrToolCalls[0] instanceof BaseMessage)
      toolCalls = merge(messagesOrToolCalls.filter(m => m instanceof AIMessage).map(m => m.tool_calls));
    else
      toolCalls = messagesOrToolCalls as ToolCall[];

    let executedToolsCount = 0;
    const toolResponses = [];

    // Sanity check: ensure AI is not generating multiple structure output calls which is not acceptable.
    const structuredOutputToolCallCount = toolCalls.filter(t => t.name === StructuredOutputToolName).length;
    if (structuredOutputToolCallCount > 1)
      throw new Error(`Model is trying to output multiple structured output, this is not supported. Improve the prompt!`);

    const structuredOutputToolCall = toolCalls.find(t => t.name === StructuredOutputToolName)
    for (let call of toolCalls) {
      if (call.name === StructuredOutputToolName) {
        // We don't invoke a structured output, but we must return it to responses so it's provided to the follow-up
        // invocation (mandatory, as the tool call was provided by the previous invoke())
        toolResponses.push(new ToolMessage({
          tool_call_id: call.id,
          name: call.name,
          content: JSON.stringify(call.args) // structured output is JSON but message content must be a json string.
        }));
      }
      else {
        const targetTool = callableTools.find(t => t.name === call.name);
        if (!targetTool)
          throw new Error(`Failed to invoke tool for tool call named ${call.name} as it's not in the provided tools list.`);

        // Invoke the tool. Output can be a string or a JS object, etc (anything decided by the tool).
        const toolInvocationResponse = await targetTool.invoke(call.args);

        toolResponses.push(new ToolMessage({
          tool_call_id: call.id,
          name: call.name,
          content: toolInvocationResponse || ""
        }));
      }

      executedToolsCount++;
    }

    return {
      executedToolsCount,
      structuredOutputToolCall,
      toolResponses
    }
  }
}
