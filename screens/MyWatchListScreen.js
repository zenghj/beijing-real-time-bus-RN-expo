import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import storage, { STORAGE_KEYS } from '../assets/js/storage';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: '我的关注',
    headerStyle: {
      backgroundColor: '#000'
    },
    headerTitleStyle: {
      color: '#fff'
    }
  };

  state = {
    list: []
  };

  willFocusDone = null;
  componentDidMount() {
    this.willFocusDone = this.props.navigation.addListener('willFocus', () => {
      console.debug('willFocus');
      storage.get(STORAGE_KEYS.WATCHED_ROUTES_BASIC_INFO).then(savedBasicInfo => {
        this.setState({
          list: Object.values(savedBasicInfo || {})
        });
      });
    })
  }
  componentWillUnmount() {
    this.willFocusDone.remove();
  }
  goToBusInfoPage = (item) => {
    let params = item.query
    if(params) {
      this.props.navigation.navigate({
        routeName: 'BusInfo',
        params,
      })
    }

  }
  render() {
    let { list } = this.state;
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return (
      <ScrollView>
        <View style={styles.container}>
          {list.map((item, index) => (
            <TouchableOpacity activeOpacity={0.6} style={styles.card} key={index} onPress={() => {this.goToBusInfoPage(item)}}>
              <View >
                <Text>{item.routeName}</Text>
                <Text>{item.curStopName}</Text>
                <Text>{item.routeInfo}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }
}

const shadow = {
  shadowColor: '#ccc',
  shadowRadius: 10,
  shadowOpacity: 0.6,
  elevation: 8,
  shadowOffset: { width: 0, height: 4 }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom:0,
  },
  card: {
    shadowColor: '#999',
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 20,
    borderRadius: 4,
    ...shadow
  }
});
