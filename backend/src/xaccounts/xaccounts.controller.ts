import { Controller, Get } from '@nestjs/common';
import { XAccountsService } from './xaccounts.service';

@Controller('xaccounts')
export class XAccountsController {
  constructor(
    private xaccounts: XAccountsService
  ) { }

  @Get('fake')
  public listFakeAccounts() {
    return this.xaccounts.listFakeAccounts();
  }
}
