import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

type StudentData = {
    name: string;
    movies: string[];
    hp: number;
    weaknesses: string;
    type: string;
    image: any;
};

const Card = ({ data, }: { data: StudentData; }) => {

    return (
        < View style={styles.cardContainer} >
            <View style={styles.title}>
                <Text style={styles.name}>{data.name}</Text>
            </View>
        </View >
    )
}

export default Card

const styles = StyleSheet.create({
    cardContainer: {
        borderRadius: 5,
        backgroundColor: "white",
        padding: 10,
        borderStyle: "solid",
        backgroundColor: "lightGray"
    },
    title: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    name: {
        color: "black",
        fontSize: 18
    },
    img: {
        flex: 1,
        alignSelf: "center",
        marginVertical: 10
    },

    movies: {
        paddingLeft: 10
    },

    size20: {
        fontSize: 20
    },
    weightbold: {
        fontWeight: "bold",
    },
    paddingTop10: {
        paddingTop: 10
    },
    typeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 4,
    },
    typeEmoji: {
        fontSize: 20,
        marginRight: 12,
    },
    typeText: {
        fontSize: 18,
        fontWeight: "bold",
    },
})