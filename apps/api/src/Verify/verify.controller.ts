import { Controller, Get, Query, Redirect } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import type { CommandBus } from "@nestjs/cqrs";
import { VerifyEmailCommand } from "../User/command/verify-email.command";

@Controller("verify")
export class VerificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService
  ) {}

  @Get()
  @Redirect("/", 302)
  async verifyEmail(@Query("token") token: string) {
    const verified = await this.commandBus.execute(
      new VerifyEmailCommand(token)
    );
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");

    const redirectUrl = verified ? "verified" : "error";

    return { url: `${frontendUrl}/${redirectUrl}` };
  }
}
