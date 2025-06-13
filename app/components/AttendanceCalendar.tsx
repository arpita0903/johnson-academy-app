import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import moment from "moment";

const AttendanceCalendar = () => {
  const today = moment().format("YYYY-MM-DD");
  const [present, setPresent] = useState([
    "2025-05-05",
    "2025-05-07",
    "2025-05-21",
    "2025-05-01",
  ]);
  const [absent, setAbsent] = useState(["2025-05-06"]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [markedDates, setMarkedDates] = useState({
    [today]: {
      selected: true,
      selectedColor: "#E0E0E0", // Initial gray if needed
    },
  });

  useEffect(() => {
    const newMarks = {};

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

  const onDayPress = (day) => {
    const newDate = day.dateString;
    setSelectedDate(newDate);
  };

  const markAttendance = (status) => {
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
    } else {
      Alert.alert(`Already marked as ${status}`, `Date: ${selectedDate}`);
    }
  };

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
          style={[styles.button, { backgroundColor: "#4CAF50" }]}
          onPress={() => markAttendance("present")}
        >
          <Text style={styles.buttonText}>Mark as Present</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#F44336" }]}
          onPress={() => markAttendance("absent")}
        >
          <Text style={styles.buttonText}>Mark as Absent</Text>
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
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
