import React, { useRef, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AttendanceCalendar from "../components/AttendanceCalendar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AssignmentModal from "./AssignmentModal";
import MRTModal from "./MRTModal";

const StudentList = ({ route, navigation }) => {
  const { batch } = route.params;
  const bottomSheetRef = useRef(null);

  const [selectedStudent, setSelectedStudent] = useState({
    name: "Pratikkshanth",
    id: "12345",
  });
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);

  const handleFabPress = () => {
    setFabVisible(true);
  };

  const handleCloseFab = () => {
    setFabVisible(false);
  };

  const handleViewAssignments = () => {
    setFabVisible(false);
    navigation.navigate("AssignmentList", { batch });
  };

  const handlePublishAssignment = () => {
    setFabVisible(false);
    navigation.navigate("PublishAssignment", { batch });
  };

  const handleStudentPress = (student) => {
    navigation.navigate("Courses", { student });
  };

  const openAttendanceSheet = (student) => {
    setSelectedStudent(student);

    bottomSheetRef.current?.expand();
  };

  const openStudentDetails = (student: any) => {
    console.log(student, "item");
    setSelectedStudent(student);
    setDetailsModalVisible(true);
  };

  const closeStudentDetails = () => {
    setDetailsModalVisible(false);
  };

  //  const handleShowMRT = () => {
  //    setDetailsModalVisible(false);
  //    navigation.navigate("MRTScreen", { student: selectedStudent });
  //  };
  console.log("detailsModalVisible", detailsModalVisible);

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.header}>{batch.name} - Students</Text>

          {/*<View style={styles.headerRow}>
          <Text style={styles.header}>{batch.name} - Students</Text>
          <TouchableOpacity onPress={() => openMenu()}>
            <Icon name="ellipsis1" size={22} />
          </TouchableOpacity>
        </View>*/}
          {/* Floating Action Button */}
          <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
          {/* FAB Action Modal */}

          <FlatList
            data={batch.students}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.studentCard}>
                <TouchableOpacity
                  onPress={() => handleStudentPress(item)}
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.studentInitial}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                  <View style={styles.infoContainer}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentId}>ID: {item.id}</Text>
                  </View>
                </TouchableOpacity>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity onPress={() => openAttendanceSheet(item)}>
                    <Icon name="calendar" size={24} color="#6200ee" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openStudentDetails(item)}>
                    <Icon name="infocirlceo" size={24} color="#6200ee" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Bottom Sheet for Attendance */}
          {selectedStudent && (
            <BottomSheet
              enableOverDrag
              enableDynamicSizing
              enablePanDownToClose
              ref={bottomSheetRef}
              index={-1}
              snapPoints={[100, "60%"]}
            >
              <BottomSheetView style={styles.contentContainer}>
                <View>
                  <Text style={styles.sheetTitle}>
                    Attendance - {selectedStudent?.name}
                  </Text>
                  <AttendanceCalendar />
                </View>
              </BottomSheetView>
            </BottomSheet>
          )}
        </View>
      </GestureHandlerRootView>
      {/*<AssignmentModal
        fabVisible={fabVisible}
        handleCloseFab={handleCloseFab}
        handlePublishAssignment={handlePublishAssignment}
        handleViewAssignments={handleViewAssignments}
      />*/}
      <MRTModal
        detailsModalVisible={detailsModalVisible}
        selectedStudent={selectedStudent}
        closeStudentDetails={closeStudentDetails}
      />
    </>
  );
};

export default StudentList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },

  sheetTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    justifyContent: "space-between",
  },
  studentInitial: {
    backgroundColor: "#6200ee",
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    height: 48,
    width: 48,
    borderRadius: 24,
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  studentId: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },

  publishButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  publishButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  actions: {
    flexDirection: "row",
    gap: 8,
  },

  headerButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },

  headerButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 30,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
});
