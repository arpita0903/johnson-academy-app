import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DetailScreen = ({ route }) => {
    const { item } = route.params;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description &&
                <View>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.text}>{item.description}</Text>
                </View>
            }
            <Text style={styles.label}>Sessions:</Text>
            <Text style={styles.text}>{item.session}</Text>

            <Text style={styles.label}>Date of Issue:</Text>
            <Text style={styles.text}>{item.date_of_issue || "N/A"}</Text>

            <Text style={styles.label}>Date of Completion:</Text>
            <Text style={styles.text}>{item.date_of_completion || "N/A"}</Text>

            <Text style={styles.label}>Remark:</Text>
            <Text style={styles.text}>{item.remark || "N/A"}</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
    },
    text: {
        fontSize: 16,
        marginTop: 4,
    },
});

export default DetailScreen;
