import type { RetentionJourneyCopy } from "../schemas";
import { DAY0_COPY } from "./copy/day0";
import { DAY1_COPY } from "./copy/day1";
import { DAY2_COPY } from "./copy/day2";
import { DAY3_COPY } from "./copy/day3";
import { DAY4_COPY } from "./copy/day4";
import { DAY5_COPY } from "./copy/day5";
import { DAY6_COPY } from "./copy/day6";
import { DAY7_COPY } from "./copy/day7";

export const RETENTION_JOURNEY_COPY: RetentionJourneyCopy = {
  day0: DAY0_COPY,
  day1: DAY1_COPY,
  day2: DAY2_COPY,
  day3: DAY3_COPY,
  day4: DAY4_COPY,
  day5: DAY5_COPY,
  day6: DAY6_COPY,
  day7: DAY7_COPY,
};
