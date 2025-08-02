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
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const AssignmentSheet = ({
  fabVisible,
  handleCloseFab,
  handlePublishAssignment,
  handleViewAssignments,
}) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => [100]);

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
    >
      <BottomSheetView style={styles.fabActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePublishAssignment}
        >
          <Text style={styles.actionText}>📤 Publish Assignment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewAssignments}
        >
          <Text style={styles.actionText}>📚 View Assignments</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
};

export default AssignmentSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  fabActions: {
    padding: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
