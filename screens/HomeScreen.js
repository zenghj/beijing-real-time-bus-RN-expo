import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Picker,
  Button,
  Alert,
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';
import {getBusLines, getBusDirList, getBusDirStationList} from '../api'

function showErrorTip(msg) {
  Alert.alert('错误提示', msg, [{text: '确定'}]);
}
export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: '北京实时公交',
    headerStyle: {
      backgroundColor: '#000'
    },
    headerTitleStyle: {
      color: '#fff'
    }
  };
  
  componentWillMount() {
    getBusLines().then(list => {
      this.setState({
        busLines: list || [],
      })
    }, (err) => {console.error(err)})
  }
  
  state = {
    
    busLines: [],
    lineId: '',
    dirs: [],
    dirId: '',
    stations: [],
    stopSeq: '',
  };
  clearDirSelect = () => {
    this.setState({
      dirs: [],
      dirId: '',
    })
  }
  clearStationSelect = () => {
    this.setState({
      stations: [],
      stopSeq: '',
    })
  }
  handleLineIdChange = (lineId) => {
    this.setState({
      lineId,
    })
    this.clearDirSelect();
    this.clearStationSelect();
    getBusDirList(lineId).then(list => {
      this.setState({
        dirs: list || [],
      })
    }, (err) => {console.error(err)})
  }
  handleDirIdChange = (dirId) => {
    this.setState({
      dirId,
    })
    this.clearStationSelect();
    getBusDirStationList(this.state.lineId, dirId).then(list => {
      this.setState({
        stations: list || [],
      })
    }, (err) => {console.error(err)})
  }
  handleStopSeqChange = (stopSeq) => {
    this.setState({
      stopSeq,
    })
  }
  queryBusInfo = () => {
    const {lineId, dirId, stopSeq } = this.state;
    if(!lineId) {
      return showErrorTip('公交路线不能为空');
    }
    if(!dirId) {
      return showErrorTip('路线方向不能为空');
    }
    if(!stopSeq) {
      return showErrorTip('上车站点不能为空');
    }
    this.props.navigation.navigate('BusInfo');
  }
  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>公交路线</Text>
            <Picker
              style={styles.picker}
              mode="dropdown"
              selectedValue={this.state.lineId}
              onValueChange={this.handleLineIdChange}
            >
              <Picker.Item itemStyle={styles.placeholder} label="请选择公交路线" value="" />
              {
                this.state.busLines.map((line, index) => (
                  <Picker.Item itemStyle={styles.pickerItem} label={line} value={line} key={index}></Picker.Item>)
                )
              }
            </Picker>
          </View>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>路线方向</Text>
            <Picker
              style={styles.picker}
              mode="dropdown"
              selectedValue={this.state.dirId}
              onValueChange={this.handleDirIdChange}
            >
              <Picker.Item itemStyle={styles.placeholder} label="请选择路线方向" value="" />
              {
                this.state.dirs.map((item, index) => (
                  <Picker.Item itemStyle={styles.pickerItem} label={item.text} value={item.id} key={index}></Picker.Item>)
                )
              }
            </Picker>
          </View>
          <View style={styles.formItem}>
            <Text style={styles.formLabel}>上车站点</Text>
            <Picker
              style={styles.picker}
              mode="dropdown"
              selectedValue={this.state.stopSeq}
              onValueChange={this.handleStopSeqChange}
            >
              <Picker.Item itemStyle={styles.placeholder} label="请选择上车站点" value="" />
              {
                this.state.stations.map((item, index) => (
                  <Picker.Item itemStyle={styles.pickerItem} label={item.text} value={item.seq} key={index}></Picker.Item>)
                )
              }
            </Picker>
          </View>
          <View style={styles.submit}>
            <Button title="查询公交信息" onPress={this.queryBusInfo}></Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use
          useful development tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  _handleLearnMorePress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/development-mode'
    );
  };

  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10
  },
  formItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formLabel: {
    width: 70
  },
  picker: {
    flexGrow: 1,
    backgroundColor: '#eee',
    paddingLeft: 20
  },
  placeholder: {
    color: '#eee',
  },
  pickerItem: {
    lineHeight: 1.5,
  },
  submit: {
    flex: 1,
  },
  // picker: {
  //   width: '100%',
  //   backgroundColor: '#eee'
  // },

  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center'
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)'
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center'
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center'
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center'
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7'
  }
});
