import { Controller, Get } from '@nestjs/common';
import { SupportedChains } from 'src/config/chain-config';
import { ChainService } from './chain.service';

@Controller('chains')
export class ChainController {
  constructor(
    private chainService: ChainService
  ) { }

  @Get()
  public getChains() {
    return SupportedChains;
  }
}
