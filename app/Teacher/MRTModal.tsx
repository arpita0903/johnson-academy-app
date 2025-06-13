import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import { Pressable } from "react-native";

const MRTModal = ({
  detailsModalVisible,
  selectedStudent,
  closeStudentDetails,
}: any) => {
  return (
    <>
      <Modal isVisible={detailsModalVisible}>
        <Pressable style={styles.centeredOverlay} onPress={closeStudentDetails}>
          {/*{selectedStudent ? (
            <>
              <Text style={styles.sheetTitle}>
                {selectedStudent.name}'s Details
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.boldLabel}>Roll number: </Text>
                {selectedStudent.id}
              </Text>
              <TouchableOpacity style={styles.mrtButton} onPress={() => {}}>
                <Text style={styles.mrtButtonText}>Show MRT</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text>Loading student data...</Text>
          )}*/}

          <Text>Loading student data...</Text>

          {/*<Pressable style={styles.detailsModal}>
            <Text style={styles.sheetTitle}>
              {selectedStudent?.name}'s Details
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldLabel}>Roll number: </Text>
              {selectedStudent?.id}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldLabel}>Instrument: </Text>
              {selectedStudent?.instrument}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldLabel}>Date of Joining: </Text>
              {selectedStudent?.date_of_joining}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldLabel}>Current Level: </Text>
              {selectedStudent?.level}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.boldLabel}>Last level promoted: </Text>
              {selectedStudent?.promoted}
            </Text>

            <TouchableOpacity style={styles.mrtButton} onPress={() => {}}>
              <Text style={styles.mrtButtonText}>Show MRT</Text>
            </TouchableOpacity>
          </Pressable>*/}
        </Pressable>
      </Modal>
    </>
  );
};

export default MRTModal;

const styles = StyleSheet.create({
  centeredOverlay: {
    flex: 1,
    //backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  detailsModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },

  detailText: {
    fontSize: 16,
    marginVertical: 4,
    color: "#444",
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },

  mrtButton: {
    marginTop: 20,
    backgroundColor: "#6200ee",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  mrtButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  boldLabel: {
    fontWeight: "bold",
  },
});
