import { ChatOpenAI } from '@langchain/openai';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ensureEnv } from 'src/utils/ensure-env';

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
}
