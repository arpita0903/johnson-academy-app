import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import {
  getStudentAttendance,
  markStudentPresent,
  markStudentAbsent,
} from "../services/attendance";
import {
  AttendanceCalendarProps,
  AttendanceResponse,
} from "../types/attendance";
import { useToast } from "../context/ToastContext";

/**
 * AttendanceCalendar Component
 *
 * Displays a calendar showing student attendance with present/absent dates marked.
 * Fetches attendance data from the API using studentId and classId.
 *
 * @example
 * <AttendanceCalendar
 *   studentId="6873618b960cf10f278aa93a"
 *   classId="687387f6e0b6e94e85464b0e"
 * />
 *
 * @param props - Component props
 * @param props.studentId - The unique identifier for the student
 * @param props.classId - The unique identifier for the class
 */
const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  studentId,
  classId,
}) => {
  const today = moment().format("YYYY-MM-DD");
  const [present, setPresent] = useState<string[]>([]);
  const [absent, setAbsent] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({
    [today]: {
      selected: true,
      selectedColor: "#E0E0E0", // Initial gray if needed
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const { showError, showSuccess } = useToast();

  // Fetch attendance data from API
  const fetchAttendanceData = async () => {
    if (!studentId || !classId) {
      setError("Student ID and Class ID are required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = (await getStudentAttendance(
        studentId,
        classId
      )) as AttendanceResponse;

      if (response.results && response.results.length > 0) {
        const attendanceData = response.results[0];

        // Store the attendance record ID for future API calls
        setAttendanceId(attendanceData.id);

        // Convert ISO dates to YYYY-MM-DD format for the calendar
        const presentDates =
          attendanceData.presentDates?.map((date: string) =>
            moment(date).format("YYYY-MM-DD")
          ) || [];

        const absentDates =
          attendanceData.absentDates?.map((date: string) =>
            moment(date).format("YYYY-MM-DD")
          ) || [];

        setPresent(presentDates);
        setAbsent(absentDates);
      } else {
        setPresent([]);
        setAbsent([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching attendance data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch attendance data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [studentId, classId]);

  useEffect(() => {
    const newMarks: Record<string, any> = {};

    present.forEach((date) => {
      newMarks[date] = {
        selected: true,
        selectedColor: "#4CAF50", // Green
        //attendance: true,
      };
    });

    absent.forEach((date) => {
      newMarks[date] = {
        selected: true,
        selectedColor: "#F44336", // Red
        //attendance: true,
      };
    });

    // Add selected date with gray if not already marked
    if (!newMarks[selectedDate]) {
      newMarks[selectedDate] = {
        selected: true,
        selectedColor: selectedDate === today ? "#E0E0E0" : "#BDBDBD",
      };
    }

    setMarkedDates(newMarks);
  }, [present, absent, selectedDate]);

  const onDayPress = (day: any) => {
    const newDate = day.dateString;
    setSelectedDate(newDate);
  };

  const markAttendance = async (status: "present" | "absent") => {
    if (!attendanceId) {
      showError("Attendance record not found. Please refresh the page.");
      return;
    }

    if (updating) {
      return; // Prevent multiple simultaneous requests
    }

    try {
      setUpdating(true);

      const payload = {
        studentId,
        classId,
        date: selectedDate,
      };

      let response;
      if (status === "present") {
        response = await markStudentPresent(attendanceId, payload);
      } else {
        response = await markStudentAbsent(attendanceId, payload);
      }

      // Update local state
      const targetArray = status === "present" ? present : absent;
      const setTarget = status === "present" ? setPresent : setAbsent;
      const otherArray = status === "present" ? absent : present;
      const setOther = status === "present" ? setAbsent : setPresent;

      if (!targetArray.includes(selectedDate)) {
        // Remove from the other array if exists
        if (otherArray.includes(selectedDate)) {
          setOther(otherArray.filter((d) => d !== selectedDate));
        }
        // Add to the correct array
        setTarget([...targetArray, selectedDate]);
      }

      showSuccess(`Marked as ${status} for ${selectedDate}`);
    } catch (err: unknown) {
      console.error(`Error marking as ${status}:`, err);
      const errorMessage =
        err instanceof Error ? err.message : `Failed to mark as ${status}`;
      showError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchAttendanceData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType={"custom"}
        style={styles.calendar}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: "#4CAF50" },
            updating && styles.buttonDisabled,
          ]}
          onPress={() => markAttendance("present")}
          disabled={updating}
        >
          <Text style={styles.buttonText}>
            {updating ? "Updating..." : "Mark as Present"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: "#F44336" },
            updating && styles.buttonDisabled,
          ]}
          onPress={() => markAttendance("absent")}
          disabled={updating}
        >
          <Text style={styles.buttonText}>
            {updating ? "Updating..." : "Mark as Absent"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AttendanceCalendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  calendar: {
    borderRadius: 10,
    elevation: 3,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 24,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
