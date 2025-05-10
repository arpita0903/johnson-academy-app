import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { teacherData } from '../components/JsonData';

const TeacherDashboard = ({ navigation }) => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Welcome, {teacherData.name} 👋</Text>
            <FlatList
                data={teacherData.instruments}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                    <View style={styles.instrumentContainer}>
                        <Text style={styles.instrumentName}>{item.name}</Text>
                        {item.batches.map((batch) => (
                            <TouchableOpacity
                                key={batch.id}
                                style={styles.card}
                                onPress={() => navigation.navigate('StudentList', { batch })}
                            >
                                <Text style={styles.batchName}>{batch.name}</Text>
                                <Text style={styles.viewStudents}>View Students →</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            />
        </ScrollView>
    );
};

export default TeacherDashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fdfcff',
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#4B0082',
        textAlign: 'center',
    },
    instrumentContainer: {
        marginBottom: 24,
    },
    instrumentName: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
        borderBottomWidth: 2,
        borderBottomColor: '#e0d7f5',
        paddingBottom: 4,
    },
    card: {
        backgroundColor: '#ffffff',
        width: "98%",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
        borderLeftWidth: 5,
        borderLeftColor: '#6a0dad',
    },
    batchName: {
        fontSize: 18,
        fontWeight: '500',
        color: '#444',
    },
    viewStudents: {
        marginTop: 6,
        color: '#6a0dad',
        fontWeight: '600',
    },
});
