import { Message } from "./message";
const ONE_MINUTE_IN_MS = 60000;

export class Timeline {
  constructor(private readonly messages: Message[]) {}

  get data() {
    this.messages.sort(
      (msgA, msgB) => msgB.publishedAt.getTime() - msgA.publishedAt.getTime(),
    );

    return this.messages.map((msg) => {
      return msg.data;
    });
  }
}
