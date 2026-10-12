// src/users/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as express from "express";
import { User } from "../entities/user.entity";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const req = ctx
      .switchToHttp()
      .getRequest<express.Request & { user: User }>();
    return req.user;
  },
);
