import { Timeline } from "../domain/timeline";

export abstract class TimelinePresenter {
  abstract show(timeline: Timeline): void;
}
