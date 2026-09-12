import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should redirect to "/todos"', () => {
      const mockResponse = {
        redirect: jest.fn(),
      };
      appController.root(mockResponse as unknown as Response);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/todos');
    });
  });
});
