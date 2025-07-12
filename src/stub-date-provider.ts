import { DateProvider } from "./post-message.usecase";

export class StubDateProvider implements DateProvider {
  now: Date | undefined;

  getNow(): Date | undefined {
    return this.now;
  }
}
