// StudentList.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';

const StudentList = ({ route }) => {
    const { batch } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{batch.name} - Students</Text>
            <FlatList
                data={batch.students}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.studentContainer}>
                        <Text style={styles.studentName}>{item.name}</Text>
                        <ProgressBar progress={item.progress / 100} color="#6200ee" style={styles.progressBar} />
                        <Text style={styles.progressText}>{item.progress}%</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default StudentList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    studentContainer: {
        marginBottom: 16,
    },
    studentName: {
        fontSize: 18,
        marginBottom: 4,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
});
