import moment from "moment";

export const currentDate = (): string => {
  return `${new Date().getUTCFullYear()}-${(new Date().getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}-${new Date().getUTCDate()}`;
};

export const HandleDateFormatToAPI = (date: string): string => {
  const localDateStr = moment(date).utc().format();

  // Convert the local date to UTC
  const utcDate = moment.utc(localDateStr + " 00:00:00", "YYYY-MM-DD HH:mm:ss");

  // Send the UTC date string to the server
  return utcDate.format();
};

export const HandleDateTimeFormatToAPI = (
  date: string,
  time?: {
    hours: number;
    minutes: number;
    seconds: number;
  }
): string => {
  // Parse the local date and time string into a Date object
  const localDate = new Date(date);

  if (time) {
    const { hours, minutes, seconds } = time;

    localDate.setHours(hours || 0, minutes || 0, seconds || 0, 0);

    // Directly convert to UTC using toISOString()
    const utcDate = localDate.toISOString();

    // Return the UTC time in ISO format
    return utcDate;
  } else {
    // Directly convert to UTC using toISOString()
    const utcDate = localDate.toISOString();

    // Return the UTC time in ISO format
    return utcDate;
  }
};

export const padWithZero = (number: number) => {
  return number.toString().padStart(2, "0");
};

export const handleAPIDateFormatToClient = (data: {
  date: Date;
  timeFormatHour: Boolean;
}): string => {
  const { date, timeFormatHour } = data;
  return moment
    .utc(date)
    .local()
    .format(timeFormatHour ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD");
};

export const startDateFormat = (date: Date): Date => {
  return new Date(
    `${date.getFullYear()}-${
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${
      date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    }T00:00:00.000Z`
  );
};

export const endDateFormat = (date: Date): Date => {
  return new Date(
    `${date.getFullYear()}-${
      date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
    }-${
      date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    }T23:59:59.999Z`
  );
};

export const convertToTime = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
};

export const calculateHoursDifference = (
  startDate: Date,
  endDate: Date
): number => {
  // Calculate the difference in milliseconds
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

  // Convert the difference from milliseconds to hours
  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);

  return differenceInHours;
};

export const ConvertToUTCStartOfDay = (date: string) => {
  const utcDate = new Date(date);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate.toISOString();
};

export const ConvertToUTCEndOfDay = (date: string) => {
  const utcDate = new Date(date);
  utcDate.setUTCHours(23, 59, 59, 999);
  return utcDate.toISOString();
};

//Use to Handle when Input Type is datetime-local
export const HandleDateTimeFormatClientToAPI = (date: string): string => {
  // Convert the local date and time to a UTC moment and format it to an ISO string
  return moment(date).utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
};
