
import moment from "moment";
import { DATETIME_FORMAT, DATETIME_WITHOUT_YEAR_FORMAT } from "../constants";

export const formatDatetime = (timestamp: number) =>
  moment.unix(timestamp).format(DATETIME_FORMAT);

export const formatDate = (date: Date | string, format: string = DATETIME_FORMAT) => {
  const dayjsDate = moment(date);
  if (dayjsDate.year() < 1970) {
    return "-";
  }
  return dayjsDate.format(format);
};

export const formatDateWithoutYear = (date: Date| string) =>
  formatDate(date, DATETIME_WITHOUT_YEAR_FORMAT);
