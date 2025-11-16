import React, { useRef, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
// import BottomSheet from "@gorhom/bottom-sheet";
// import AttendanceCalendar from "../components/AttendanceCalendar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../context/ThemeContext";
import { ThemeColors } from "../theme/colors";
import AssignmentModal from "./AssignmentModal";
import { useTeacherContext } from "../context/TeacherContext";

const StudentList = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { batch } = route.params;
  const { colors } = useTheme();
  // const bottomSheetRef = useRef<BottomSheet>(null);

  // const [selectedStudent, setSelectedStudent] = useState({
  //   name: "",
  //   id: "",
  // });
  // const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);
  const { selectStudent } = useTeacherContext();

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

  const handleStudentPress = (student: any) => {
    selectStudent(student);
    navigation.navigate("Course", { student, batch });
  };

  // const openAttendanceSheet = (student: any) => {
  //   setSelectedStudent(student);

  //   bottomSheetRef.current?.expand();
  // };

  // const openStudentDetails = (student: any) => {
  //   setSelectedStudent(student);
  //   setDetailsModalVisible(true);
  // };

  // const closeStudentDetails = () => {
  //   setDetailsModalVisible(false);
  // };

  const dynamicStyles = createStyles(colors);

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={dynamicStyles.container}>
          <Text style={dynamicStyles.header}>{batch.name} - Students</Text>

          <TouchableOpacity style={dynamicStyles.fab} onPress={handleFabPress}>
            <Icon name="plus" size={24} color={colors.primaryText} />
          </TouchableOpacity>
          {/* FAB Action Modal */}

          <FlatList
            data={batch.students}
            keyExtractor={(item) => item.id}
            contentContainerStyle={dynamicStyles.listContent}
            renderItem={({ item }) => (
              <View style={dynamicStyles.studentCard}>
                <TouchableOpacity
                  onPress={() => handleStudentPress(item)}
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={
                      item.profilePicture
                        ? { uri: item.profilePicture }
                        : require("../../assets/images/profileDefault.png")
                    }
                    style={dynamicStyles.studentImage}
                  />
                  {/* <Text style={dynamicStyles.studentInitial}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text> */}
                  <View style={dynamicStyles.infoContainer}>
                    <Text style={dynamicStyles.studentName}>{item.name}</Text>
                    <Text style={dynamicStyles.studentId}> {item.email}</Text>
                  </View>
                </TouchableOpacity>

                {/* <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity onPress={() => openAttendanceSheet(item)}>
                    <Icon name="calendar" size={24} color="#6200ee" />
                  </TouchableOpacity>
                </View> */}
              </View>
            )}
          />

          {/* Bottom Sheet for Attendance */}
          {/* {selectedStudent && (
            <BottomSheet
              enableOverDrag
              enableDynamicSizing
              enablePanDownToClose
              ref={bottomSheetRef}
              index={-1}
              snapPoints={["75%"]}
            >
              <BottomSheetView style={styles.contentContainer}>
                <View>
                  <Text style={styles.sheetTitle}>
                    Attendance - {selectedStudent?.name}
                  </Text>
                  <AttendanceCalendar
                    studentId={selectedStudent.id}
                    classId={batch.id}
                  />
                </View>
              </BottomSheetView>
            </BottomSheet>
          )} */}
        </View>
      </GestureHandlerRootView>
      <AssignmentModal
        fabVisible={fabVisible}
        handleCloseFab={handleCloseFab}
        handlePublishAssignment={handlePublishAssignment}
        handleViewAssignments={handleViewAssignments}
      />
    </>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    contentContainer: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.background,
    },
    header: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 24,
      textAlign: "center",
    },
    listContent: {
      paddingBottom: 100, // Extra space for FAB
    },
    sheetTitle: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 10,
      textAlign: "center",
      color: colors.text,
    },
    studentCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      marginBottom: 16,
      backgroundColor: colors.card,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: colors.shadow,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 6,
      justifyContent: "space-between",
    },
    studentInitial: {
      backgroundColor: colors.primary,
      color: colors.primaryText,
      fontSize: 22,
      fontWeight: "bold",
      height: 56,
      width: 56,
      borderRadius: 28,
      textAlign: "center",
      textAlignVertical: "center",
      marginRight: 16,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 4,
    },
    infoContainer: {
      flex: 1,
    },
    studentName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    studentId: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    publishButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 10,
    },
    publishButtonText: {
      color: colors.primaryText,
      fontWeight: "bold",
      fontSize: 14,
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
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      marginLeft: 8,
    },
    headerButtonText: {
      color: colors.primaryText,
      fontWeight: "bold",
      fontSize: 14,
    },
    fab: {
      position: "absolute",
      bottom: 30,
      right: 20,
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 32,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
      zIndex: 100,
    },
    studentImage: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 16,
    },
  });

export default StudentList;
