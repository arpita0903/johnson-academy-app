import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from "react-native";
import { ProgressBar } from "react-native-paper";
import { instrumentData } from "../components/JsonData";

const Homepage = ({ navigation }) => {
  const handleSubmit = () => {
    navigation.navigate("Courses");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome,</Text>
        <Text style={styles.username}>
          Hello, <Text style={{ fontWeight: "bold" }}>Jess</Text>
        </Text>
      </View>

      {/* Offer Banner */}
      <TouchableOpacity style={styles.banner}>
        <View>
          <Text style={styles.bannerTitle}>Musical Instruments Offer</Text>
          <Text style={styles.bannerCTA}>Click Now &gt;</Text>
        </View>
        <Image
          source={require("../../assets/images/instruments.png")}
          style={{ width: 150, height: 120 }}
        />
      </TouchableOpacity>

      {/* Instruments Section */}
      <View style={styles.header}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Instrument</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {/*<ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        >*/}
        <FlatList
          data={instrumentData}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={handleSubmit}>
              <View style={styles.instrumentCard}>
                <Image source={item.image} style={styles.instrumentIcon} />
                <Text style={styles.instrumentName}>{item.name}</Text>
                <View>
                  <Text style={styles.courseProgress}>
                    Progress: {Math.round(item.progress * 100)}%
                  </Text>
                  <ProgressBar
                    progress={item.progress}
                    color="#8a1dc2"
                    style={styles.progressBar}
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      {/*</ScrollView>*/}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assignment</Text>
      </View>

      <View style={styles.assignmentContainer}>
        {false ? (
          <View style={styles.assignmentBox}>
            <Text style={styles.assignmentText}>
              🎉 No assignments right now!
            </Text>
            <Text style={styles.assignmentSubtext}>
              No tasks for now. Time to jam with your favorite tunes!
            </Text>
          </View>
        ) : (
          <View style={styles.assignmentBox}>
            <Text style={styles.assignmentText}>
              📘 You have a new assignment!
            </Text>
            <TouchableOpacity
              style={styles.assignmentButton}
              onPress={() => navigation.navigate("AssignmentDetail")} // replace with your screen name
            >
              <Text style={styles.assignmentButtonText}>View Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Homepage;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F0",
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  welcome: {
    fontSize: 16,
    color: "#666",
  },
  username: {
    fontSize: 20,
    color: "#000",
  },
  banner: {
    backgroundColor: "#FFB74D",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  bannerCTA: {
    color: "#fff",
    marginTop: 4,
  },
  bannerImage: {
    position: "absolute",
    width: 100,
    height: 100,
    right: 0,
    top: 0,
    resizeMode: "contain",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAll: {
    color: "#FF7043",
    fontWeight: "600",
  },
  instruments: {
    flexDirection: "row",
  },
  scrollContainer: {
    marginVertical: 16,
  },
  instrumentCard: {
    backgroundColor: "#FFEFD5",
    borderRadius: 16,
    padding: 12,
    paddingBottom: 20,
    width: 180,
    marginRight: 12, // optional spacing between cards
    alignItems: "center",
  },
  instrumentIcon: {
    width: 150,
    height: 150,
    marginBottom: 8,
    resizeMode: "contain",
    // backgroundColor: "#FFB74D",
    borderRadius: 100,
  },
  instrumentName: {
    fontWeight: "bold",
    fontSize: 20,
  },
  instrumentDetails: {
    fontSize: 12,
    color: "#666",
  },
  courseProgress: {
    marginVertical: 6,
    fontStyle: "italic",
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: 120,
  },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  assignmentContainer: {
    marginTop: 14,
    padding: 20,
    paddingVertical: 40,
    backgroundColor: "#fcefee",
    borderRadius: 16,
  },
  assignmentBox: {
    alignItems: "center",
  },
  assignmentText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#c2185b",
    marginBottom: 8,
  },
  assignmentSubtext: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  assignmentButton: {
    backgroundColor: "#c2185b",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  assignmentButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
