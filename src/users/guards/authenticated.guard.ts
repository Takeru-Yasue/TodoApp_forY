import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Response } from "express";
import { UsersService } from "../users.service";
import { AuthenticatedRequest } from "../types/authenticated-request";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const response = http.getResponse<Response>();

    const rawUserId: unknown = request.signedCookies.userId;
    const userId =
      typeof rawUserId === "string" ? parseInt(rawUserId, 10) : NaN;

    if (isNaN(userId)) {
      response.redirect("/login");
      return false;
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      response.clearCookie("userId");
      response.redirect("/login");
      return false;
    }

    request.user = user;
    return true;
  }
}
