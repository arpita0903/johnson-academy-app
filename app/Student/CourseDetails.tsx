import * as React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theoryContent, technicalContent, songContent } from "../components/JsonData"

import { useNavigation } from '@react-navigation/native';

const getStatusIcon = (item) => {
  if (item.date_of_completion) {
    return <Icon name="check-circle" size={24} color="green" style={{ marginRight: 8 }} />;
  } else if (item.date_of_issue) {
    return <Icon name="timelapse" size={24} color="orange" style={{ marginRight: 8 }} />;
  } else {
    return <Icon name="radio-button-unchecked" size={24} color="gray" style={{ marginRight: 8 }} />;
  }
};




const initialLayout = { width: Dimensions.get('window').width };

const CourseDetails = () => {
  const navigation = useNavigation();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'theory', title: 'Theory' },
    { key: 'technical', title: 'Technical' },
    { key: 'learning', title: 'Learning' },
  ]);

  const TheoryRoute = () => (
    <ScrollView style={styles.content}>
      {
        theoryContent.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate('Detail', { item })}
          >
            <Card style={[styles.card, !item?.date_of_issue && styles.disableCard]}>
              <Card.Title
                title={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {getStatusIcon(item)}
                    <Text style={[styles.cardText, !item?.date_of_issue && styles.disableCardText]}>{item.title}</Text>
                  </View>
                }
              />
            </Card>
          </TouchableOpacity>
        ))
      }
    </ScrollView>
  );

  const TechnicalRoute = () => (
    <ScrollView style={styles.content}>
      {
        technicalContent.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate('Detail', { item })}
          >
            <Card style={[styles.card, !item?.date_of_issue && styles.disableCard]}>
              <Card.Title
                title={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {getStatusIcon(item)}
                    <Text style={[styles.cardText, !item?.date_of_issue && styles.disableCardText]}>{item.title}</Text>
                  </View>
                }
              />
            </Card>
          </TouchableOpacity>
        ))
      }
    </ScrollView>
  );

  const LearningRoute = () => (
    <ScrollView style={styles.content}>
      {
        songContent.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate('Detail', { item })}
            disabled={!item?.date_of_issue}
          >
            <Card style={[styles.card, !item?.date_of_issue && styles.disableCard]}>
              <Card.Title
                title={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {getStatusIcon(item)}
                    <Text style={[styles.cardText, !item?.date_of_issue && styles.disableCardText]}>{item.title}</Text>
                  </View>
                }
              />
            </Card>
          </TouchableOpacity>
        ))
      }
    </ScrollView>
  );

  const renderScene = SceneMap({
    theory: TheoryRoute,
    technical: TechnicalRoute,
    learning: LearningRoute,
  });


  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={props => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: 'white' }} //s#c4c3c2
          style={{ backgroundColor: 'purple' }}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 12,
  },
  card: {
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#e0f5ec',
  },
  disableCard: {
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#d9d9d9',
  },
  cardText: {
    fontSize: 18,

  },
  disableCardText: {
    opacity: 0.4
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
});

export default CourseDetails;
