# Whim Event design document
 
 `IParsedDate` is the primary interface for returning a parsed date string. A difficult but necessary feature is converting text to recognizable dates - for reminders, birthdays, and any other future events.

 ```
 export interface IParsedDate {
  startDate: number;
  endDate: number;
  recurrence: IRecurrence;
  reminder: number;
}
 ```

 ## Properties and Assumptions
 
1) For V1, we assume one date per input string (or input string array)
2) All dates, including reminders, are stored as *numeric timestamps*.
    - MomentJs is used to parse these timestamps and perform date manipulation and string formatting.
 3) Event dates are dates, not datetimes. Time information is discarded or ignored.
     - Reminders are dates for V1.
     - Later, reminders can be datetimes.
 
 
 ## Test cases:

 The following must all pass for a valid date parser:
 1. Today
 2. Tomorrow
 3. tomorrow
 4. hello world
 5. next week
 6. on Monday
 7. next Tuesday
 8. every Wednesday
 9. every other Thursday
 10. on September 7th
 11. on August 25, 2018
 12. starting Monday
 13. starting Tuesday every week
 14. starting Wednesday every week for 2 weeks
 15. starting Thursday every day for 2 months
 16. every Friday for 2 days
 17. starting next Saturday until September 18, 2018
 18. starting Sunday every day until next year
 19. starting today every 2 days for 5 months

 STARTDATE: on/starting [date]
 RECUREVERY: every [amount?] [interval]
 RECURFOR: for [amount] [interval] 
