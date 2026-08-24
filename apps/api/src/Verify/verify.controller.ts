import { Controller, Get, Query, Redirect } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Public } from "../Auth/public.decorator.js";
import { UserService } from "../User/user.service.js";

@Public()
@Controller("verify")
export class VerificationController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Redirect("/", 302)
  async verifyEmail(@Query("token") token: string) {
    const verified = await this.userService.verifyEmail(token);
    const frontendUrl = this.configService.get<string>("FRONTEND_URL");
    const redirectUrl = verified ? "verified" : "error";
    return { url: `${frontendUrl}/${redirectUrl}` };
  }
}
