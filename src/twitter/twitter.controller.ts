import { Controller } from '@nestjs/common';
import { TwitterAuthService } from './twitter-auth.service';

@Controller('twitter')
export class TwitterController {
  constructor(
    private readonly twitterService: TwitterAuthService
  ) { }
}
