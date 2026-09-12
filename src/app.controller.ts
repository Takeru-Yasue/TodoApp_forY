import { Controller, Get, Res } from '@nestjs/common';
import * as express from 'express';

@Controller()
export class AppController {
  @Get()
  root(@Res() res: express.Response) {
    return res.redirect('/todos');
  }
}
