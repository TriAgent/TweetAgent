import { ToolCall } from '@langchain/core/dist/messages/tool';
import { InputValues } from '@langchain/core/dist/utils/types';
import { AIMessage, BaseMessage, BaseMessageLike, ToolMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableLike, RunnableSequence } from '@langchain/core/runnables';
import { StructuredTool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { merge } from "lodash";
import { AppLogger } from 'src/logs/app-logger';
import { ensureEnv } from 'src/utils/ensure-env';
import { infer as zodInfer, ZodType } from 'zod';
import { StructureToolOrBindToolsInput, zodSchemaToOpenAICompatibleTool } from './utils';

const StructuredOutputToolName = "structured_output";

export type FullInvocationInput<RunInput extends InputValues = any, OutputSchema extends ZodType = any> = {
  messages: BaseMessageLike[];
  invocationParams?: RunInput | string;
  tools?: StructuredTool[];
  structuredOutput?: OutputSchema;
  runnablesBefore?: RunnableLike[]
}

type FullInvocationOutput<OutputSchema extends ZodType> = {
  responseMessage: BaseMessage;
  stringResponse?: string;
  structuredResponse?: zodInfer<OutputSchema>
}

@Injectable()
export class LangchainService implements OnModuleInit {
  private logger = new AppLogger("Langchain");

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
   * 
   * @param invocationParams JSON or string. JSON preferred, string mostly when using vector stores because using {} creates many issues (text.replace is not a function, $.input is invalid...). "" solves this unclear problem
   * @param runnablesBefore Prepended to the runnable chain before adding prompt and model. For example, to pass a vector store.
   */
  public async fullyInvoke<RunInput extends InputValues = any, OutputSchema extends ZodType = any>(inputs: FullInvocationInput<RunInput, OutputSchema>): Promise<FullInvocationOutput<OutputSchema>> {
    const defaultInputs: FullInvocationInput<RunInput, OutputSchema> = {
      messages: [],
      tools: [],
      structuredOutput: undefined,
      runnablesBefore: [],
      invocationParams: {} as RunInput
    };
    const { tools, structuredOutput, messages, runnablesBefore, invocationParams } = { ...defaultInputs, ...inputs };

    const allTools: StructureToolOrBindToolsInput[] = tools; // can be an empty array

    messages.push(["system", `Today's date is ${new Date().toISOString()}. Make sure to take this date into account when answering`]);

    // If the output is structured, add it as a tool, this is the recommended way to mix tools and structured output.
    if (structuredOutput) {
      allTools.push(zodSchemaToOpenAICompatibleTool(StructuredOutputToolName, structuredOutput));

      // Try to make sure LLM always calls the structured output tool, otherwise it sometimes doesnt
      messages.push(["system", "Return your reply as structured output and call suitable tools"]);
    }

    const model = this.getModel().bindTools(allTools);

    try {
      const messageHistory = [...messages];
      //const messageHistory: BaseMessage[] = await prompt.formatMessages(invocationParams);
      let responseMessage: AIMessage;
      let structuredResponse: zodInfer<OutputSchema>; // zod type to simple typescript fields
      let stringResponse: string;
      while (true) {
        const chain = RunnableSequence.from([
          ...runnablesBefore,
          ChatPromptTemplate.fromMessages(messageHistory),
          model,
        ] as any); // dirty as any because of headache with from() typing (first input type etc)
        responseMessage = await chain.invoke(invocationParams); // NOTE: using "" instead of "" to avoid text.replace is not a function when using vector stores

        stringResponse = responseMessage?.content.toString();

        // Save this preliminary/final message to history
        messageHistory.push(responseMessage);

        const { executedToolsCount, structuredOutputToolCall, toolResponses } = await this.executeToolCalls(allTools, responseMessage.tool_calls);

        if (executedToolsCount === 0)
          break;

        structuredResponse = structuredOutputToolCall?.args;
        messageHistory.push(...toolResponses);
      }

      if (structuredOutput && !structuredResponse) {
        this.logger.error(`LLM invocation expected a structured response but did not get one. Got this response instead:`);
        this.logger.error(messageHistory);
        this.logger.error(responseMessage);
      }

      return { responseMessage, structuredResponse, stringResponse }
    }
    catch (e) {
      console.error("fullyInvoke error", e);
      debugger;
      return { responseMessage: undefined };
    }
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

        this.logger.log(`Invoking LLM tool: ${targetTool.name}`);

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
