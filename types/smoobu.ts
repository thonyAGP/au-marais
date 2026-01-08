export interface DayRate {
  price: number | null;
  min_length_of_stay: number | null;
  available: 0 | 1;
}

export interface RatesResponse {
  data: {
    [apartmentId: string]: {
      [date: string]: DayRate;
    };
  };
}

export interface CalendarDay {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  available: boolean;
  price: number | null;
  minStay: number | null;
}

export interface DateRange {
  checkIn: string | null;
  checkOut: string | null;
}
