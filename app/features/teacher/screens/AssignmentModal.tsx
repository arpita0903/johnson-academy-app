//import React from "react";
//import { Pressable, TouchableOpacity } from "react-native";
//import { StyleSheet, Text } from "react-native";

//import Modal from "react-native-modal";

//const AssignmentModal = ({
//  fabVisible,
//  handleCloseFab,
//  handlePublishAssignment,
//  handleViewAssignments,
//}) => {
//  return (
//    <>
//      <Modal isVisible={fabVisible}>
//        <Pressable onPress={handleCloseFab} style={styles.modalOverlay}>
//          <Pressable style={styles.fabActions}>
//            <TouchableOpacity
//              style={styles.actionButton}
//              onPress={handlePublishAssignment}
//            >
//              <Text style={styles.actionText}>📤 Publish Assignment</Text>
//            </TouchableOpacity>
//            <TouchableOpacity
//              style={styles.actionButton}
//              onPress={handleViewAssignments}
//            >
//              <Text style={styles.actionText}>📚 View Assignments</Text>
//            </TouchableOpacity>
//          </Pressable>
//        </Pressable>
//      </Modal>
//    </>
//  );
//};

//export default AssignmentModal;

//const styles = StyleSheet.create({
//  modalOverlay: {
//    flex: 1,
//    //backgroundColor: "rgba(0,0,0,0.5)",
//    justifyContent: "flex-end",
//  },
//  fabActions: {
//    backgroundColor: "#fff",
//    padding: 20,
//    borderTopLeftRadius: 20,
//    borderTopRightRadius: 20,
//  },
//  actionButton: {
//    paddingVertical: 16,
//    borderBottomWidth: 1,
//    borderBottomColor: "#eee",
//  },

//  actionText: {
//    fontSize: 16,
//    fontWeight: "600",
//    color: "#333",
//  },
//});

import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "../../../context/ThemeContext";

type AssignmentSheetProps = {
  fabVisible: boolean;
  handleCloseFab: () => void;
  handlePublishAssignment: () => void;
  handleViewAssignments: () => void;
};

const AssignmentSheet: React.FC<AssignmentSheetProps> = ({
  fabVisible,
  handleCloseFab,
  handlePublishAssignment,
  handleViewAssignments,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [190], []);
  const { isDark } = useTheme();
  const styles = createStyles(isDark);

  useEffect(() => {
    if (fabVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [fabVisible]);

  const handleSheetClose = () => {
    handleCloseFab();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleSheetClose}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.fabActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePublishAssignment}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>Publish Assignment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewAssignments}
          activeOpacity={0.85}
        >
          <Text style={styles.actionText}>View Assignments</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default AssignmentSheet;

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    sheetBackground: {
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 1)"
        : "rgba(255, 255, 255, 1)",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    handleIndicator: {
      backgroundColor: isDark ? "#94A3B8" : "#64748B",
      width: 44,
    },
    fabActions: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 18,
      backgroundColor: "transparent",
    },
    header: {
      marginBottom: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
      color: isDark ? "#F8FAFC" : "#0f172a",
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: "600",
      lineHeight: 19,
      color: isDark ? "#94A3B8" : "#64748B",
    },
    actionButton: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginBottom: 10,
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.92)"
        : "rgba(255, 255, 255, 0.94)",
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(255, 255, 255, 0.28)"
        : "rgba(255, 255, 255, 1)",
    },
    actionText: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.25,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
  });
