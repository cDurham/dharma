import { Command } from "@nestjs/cqrs";

export class VerifyEmailCommand extends Command<boolean> {
  constructor(public readonly token: string) {
    super();
  }
}
