import { TZ_TEMPLATE } from "@/constant/date";
import dayjs from "dayjs";

export const formatTZ = (tz: string, template: string) => {
  if (tz) {
    return dayjs(tz).format(template);
  }
  return null;
};

export const getCurrent = (unit: string) => {
  return dayjs().add(0, "hour").format(unit);
};

export const getLastDateOfMonth = (startDate: string, template: string) => {
  return dayjs(startDate).endOf("month").format(template);
};

export const compareDate = {
  before: (date01: string, date02: string) => {
    return dayjs(date01).isBefore(date02);
  },

  after: (date01: string, date02: string) => {
    return dayjs(date01).isAfter(date02);
  },

  equal: (date01: string, date02: string) => {
    return dayjs(date01).isSame(date02);
  },
};

export const parseHour = (tz: string) => {
  if (tz) {
    return dayjs(`${dayjs().format(TZ_TEMPLATE.year_month_day)} ${tz}`).format(
      TZ_TEMPLATE.hour,
    );
  }
  return null;
};
