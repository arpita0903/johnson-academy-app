/**
 * Utility functions for date and month operations
 */

export interface MonthOption {
  label: string;
  value: string;
}

/**
 * Generates months from joining date to current date
 * @param joiningDate - The date when the student joined
 * @returns Array of month options with label and value
 */
export const generateFilteredMonths = (
  joiningDate: string | Date
): MonthOption[] => {
  if (!joiningDate) return [];

  try {
    const joining = new Date(joiningDate);
    const current = new Date();

    // Validate dates
    if (isNaN(joining.getTime()) || isNaN(current.getTime())) {
      console.warn("Invalid date format");
      return [];
    }

    const months: MonthOption[] = [];

    // Start from the month after joining (since joining month might be partial)
    let startDate = new Date(joining.getFullYear(), joining.getMonth() + 1, 1);

    // Ensure we don't go beyond current month
    const currentMonth = new Date(current.getFullYear(), current.getMonth(), 1);

    // If joining date is in the future, start from current month
    if (startDate > currentMonth) {
      startDate = new Date(current.getFullYear(), current.getMonth(), 1);
    }

    // Generate months from start date to current month (exclusive)
    while (startDate < currentMonth) {
      const monthName = startDate.toLocaleString("default", {
        month: "long",
      });
      const year = startDate.getFullYear();
      const value = `${monthName.slice(0, 3)}-${year}`;

      months.push({
        label: `${monthName} ${year}`,
        value: value,
      });

      // Move to next month
      startDate.setMonth(startDate.getMonth() + 1);
    }

    // Add current month
    if (startDate <= currentMonth) {
      const currentMonthName = current.toLocaleString("default", {
        month: "long",
      });
      const currentYear = current.getFullYear();
      const currentMonthValue = `${currentMonthName.slice(
        0,
        3
      )}-${currentYear}`;

      months.push({
        label: `${currentMonthName} ${currentYear}`,
        value: currentMonthValue,
      });
    }

    return months;
  } catch (error) {
    console.error("Error generating months:", error);
    return [];
  }
};

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string in "5 Aug 2025" format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Format as "5 Aug 2025"
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

/**
 * Checks if a date is in the future
 * @param {string} dateString - ISO date string
 * @returns True if date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const current = new Date();
    return date > current;
  } catch (error) {
    console.error("Error checking future date:", error);
    return false;
  }
};

/**
 * Converts month format from "Jan-2025" to "MM-YYYY" format
 * @param {string} monthString - Month in "Jan-2025" format
 * @returns Month in "MM-YYYY" format
 */
export const convertMonthFormat = (monthString: string): string => {
  try {
    const monthParts = monthString.split("-");
    const monthName = monthParts[0];
    const year = monthParts[1];

    // Create a reliable month name to number mapping
    const monthMap: { [key: string]: number } = {
      Jan: 1,
      January: 1,
      Feb: 2,
      February: 2,
      Mar: 3,
      March: 3,
      Apr: 4,
      April: 4,
      May: 5,
      Jun: 6,
      June: 6,
      Jul: 7,
      July: 7,
      Aug: 8,
      August: 8,
      Sep: 9,
      September: 9,
      Oct: 10,
      October: 10,
      Nov: 11,
      November: 11,
      Dec: 12,
      December: 12,
    };

    const monthNumber = monthMap[monthName];

    if (monthNumber === undefined) {
      console.error("Invalid month name:", monthName);
      return monthString; // Return original if month name not found
    }

    // Convert to 1-based month number and pad with zero
    const formattedMonth = monthNumber.toString().padStart(2, "0");

    return `${formattedMonth}-${year}`;
  } catch (error) {
    console.error("Error converting month format:", error);
    return monthString; // Return original if conversion fails
  }
};
