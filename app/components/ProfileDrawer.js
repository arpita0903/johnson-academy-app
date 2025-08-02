import React, {useState} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import profileImage from '../../assets/images/profileDefault.jpg';

const MusicProfile = ({navigation}) => {
    const [activeInstrument, setActiveInstrument] = useState('Piano');

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                {/*<View style={styles.headerIcons}>
                    <Icon name="share-outline" size={22} color="#000" style={styles.icon} />
                    <Icon name="create-outline" size={22} color="#000" />
                </View>*/}
                <TouchableOpacity onPress={() => navigation.navigate("Main", {screen: "Login"})}>
                    <Text style={styles.noShowTag}>Log Out</Text>
                </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <View style={styles.profileSection}>
                <Image source={profileImage} style={styles.profileImage} />
                <Text style={styles.name}>Pratik Yadav</Text>
                <Text style={styles.subtext}>Last practiced on 17th May</Text>
                <View style={styles.statsRow}>
                    <StatItem number="14/20" label="Classes" />
                    <StatItem number="5" label="Assignment Submitted" />
                    <StatItem number="9.5" label="Score" />
                </View>

            </View>

            {/* Weekly Practice Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>18 May - 24 May</Text>
                {/*<Text style={styles.cardSub}>Completed 0% of your weekly goal</Text>*/}
                {/*<Text style={styles.minsTag}>0/300 MIN</Text>*/}

                {/* Weekly Progress */}
                <View style={styles.progressRow}>
                    {['20%', '60%', '30%', '0%'].map((item, i) => (
                        <View key={i} style={styles.progressItem}>
                            <Text style={styles.progressPercent}>{item}</Text>
                            <Text style={styles.progressDate}>
                                {['JUN', 'JUL', 'AUG', 'SEPT'][i]}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Active Level */}
            {/*<View style={styles.card}>
                <Text style={styles.sectionTitle}>Active Level</Text>
                <Text style={styles.learnMore}>Learn More</Text>
                <View style={styles.levelRow}>
                    {['Warming Up', 'Active', 'Super Active', 'On Fire'].map((level, index) => (
                        <Text key={index} style={styles.levelText}>{level}</Text>
                    ))}
                </View>
            </View>*/}

            {/* Badges */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Appreciation Badges</Text>
                {/*<Text style={styles.learnMore}>See All</Text>*/}
                <View style={styles.badgeRow}>
                    <Badge title="Punctual" count={'90 %'} />
                    <Badge title="Best Student" count={13} />
                </View>
            </View>

            {/* Leaderboard */}


            {/* Music Stats Overview */}
            <View style={styles.card}>
                {/*<View style={styles.card}>*/}
                <Text style={styles.sectionTitle}>Leaderboard</Text>
                <Text style={styles.learnMore}>View Leaderboard</Text>
                {/*</View>*/}
                {/* Chart & Rank */}
                {/*<Text style={styles.sectionTitle}>145 Sessions</Text>*/}
                <View style={{flexDirection: 'row', justifyContent: 'space-around', marginTop: 12}}>
                    <View style={{alignItems: 'center'}}>
                        <View style={styles.pieChartPlaceholder}>
                            {/* Replace with actual pie chart if using Victory or react-native-chart-kit */}
                            <Text style={{fontWeight: 'bold'}}>Pie Chart</Text>
                        </View>
                        <View style={{marginTop: 8}}>
                            <Text style={styles.legendText}>🎹 Piano - 93</Text>
                            <Text style={styles.legendText}>🎸 Guitar - 24</Text>
                            <Text style={styles.legendText}>🥁 Other - 28</Text>
                        </View>
                    </View>
                    <View style={{alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={styles.peerRankLabel}>Peer Rank</Text>
                        <Text style={styles.peerRank}>#21</Text>
                    </View>
                </View>
            </View>

            {/* My Instruments Section */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>My Instruments</Text>
                <View style={{marginTop: 20, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flexDirection: 'row', gap: 8}}>
                        {['Piano', 'Guitar', 'Drums'].map((inst, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setActiveInstrument(inst)}
                                style={[
                                    styles.instrumentTab,
                                    activeInstrument === inst && styles.instrumentTabActive
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.instrumentTabText,
                                        activeInstrument === inst && styles.instrumentTabTextActive
                                    ]}
                                >
                                    {inst}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>


                <View style={{marginTop: 12}}>
                    <Text style={styles.peerRankLabel}>Piano Peer Rank #381</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 8}}>
                        <View>
                            <Text style={styles.levelLabel}>Overall</Text>
                            <Text style={styles.levelTag}>Intermediate</Text>
                        </View>
                        <View>
                            <Text style={styles.levelLabel}>Self</Text>
                            <Text style={styles.levelValue}>Intermediate ✏️</Text>
                        </View>
                    </View>

                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}}>
                        <Text style={styles.levelLabel}>Sessions</Text>
                        <Text style={styles.levelLabel}>Last 5 Ratings</Text>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={{fontWeight: 'bold'}}>93</Text>
                        <Text style={{fontSize: 16, letterSpacing: 6}}>X X X X X</Text>
                    </View>
                </View>
            </View>

            {/* Groups */}
            {/*<View style={styles.card}>
                <Text style={styles.sectionTitle}>Groups</Text>
                <View style={styles.groupItem}>
                    <Text style={styles.groupName}>🎼 Bangalore Piano Circle</Text>
                    <Text style={styles.groupMembers}>249 Members</Text>
                </View>
            </View>*/}

        </ScrollView >
    );
};

const StatItem = ({number, label}) => (
    <View style={{alignItems: 'center'}}>
        <Text style={styles.statNumber}>{number}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const Badge = ({title, count}) => (
    <View style={styles.badge}>
        <Icon name="ribbon-outline" size={24} color="#00aaff" />
        <Text>{title} - {count}</Text>
    </View>
);

export default MusicProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
    },
    subtext: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 16,
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
        color: '#888',
    },
    noShowTag: {
        backgroundColor: '#fee',
        color: '#d00',
        padding: 6,
        marginTop: 10,
        borderRadius: 4,
        fontWeight: "bold"
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    cardSub: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    minsTag: {
        alignSelf: 'flex-end',
        backgroundColor: '#f0f0f0',
        padding: 6,
        borderRadius: 12,
        marginTop: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    progressItem: {
        alignItems: 'center',
    },
    progressPercent: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    progressDate: {
        fontSize: 10,
        color: '#888',
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    learnMore: {
        position: 'absolute',
        right: 16,
        top: 16,
        fontSize: 12,
        color: '#00aaff',
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    levelText: {
        fontSize: 12,
        color: '#666',
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    badge: {
        alignItems: 'center',
        gap: 4,
    },
    pieChartPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    legendText: {
        fontSize: 12,
        color: '#555',
    },
    peerRankLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    peerRank: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
    },
    instrumentTab: {
        backgroundColor: '#e0f7ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    instrumentTabActive: {
        backgroundColor: '#007acc',
    },
    instrumentTabText: {
        fontSize: 12,
        color: '#007acc',
        fontWeight: 'bold',
    },
    instrumentTabTextActive: {
        color: '#fff',
    },

    instrumentTabText: {
        fontSize: 12,
        color: '#007acc',
        fontWeight: 'bold',
    },
    levelLabel: {
        fontSize: 12,
        color: '#777',
    },
    levelTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        fontSize: 12,
        marginTop: 4,
    },
    levelValue: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    groupItem: {
        marginTop: 12,
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
    },
    groupName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    groupMembers: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },

});
