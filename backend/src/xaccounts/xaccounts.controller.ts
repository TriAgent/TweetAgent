import { Controller, Get } from '@nestjs/common';
import { XAccountsService } from './xaccounts.service';

@Controller('xaccounts')
export class XAccountsController {
  constructor(
    private xaccounts: XAccountsService
  ) { }

  @Get()
  public getAllAccounts() {
    return this.xaccounts.listAllAccounts();
  }

  @Get('fake')
  public listFakeAccounts() {
    return this.xaccounts.listFakeAccounts();
  }
}
