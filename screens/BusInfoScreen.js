import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Button,
  ProgressBarAndroid,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getBusTimeInfo } from '../api';
import { Icon } from 'expo';
import { tintColor } from '../constants/Colors';
import storage, { STORAGE_KEYS } from '../assets/js/storage';
import colors from '../constants/Colors';

function encodeWatchUniqueKey(query) {
  if (query && typeof query === 'object') {
    return `${query.lineId}_${query.dirId}_${query.stopSeq}`;
  }
  return query;
}

export default class BusInfoScreen extends React.Component {
  static navigationOptions = {
    // headerStyle: {
    //   backgroundColor: '#000'
    // },
    // headerTitleStyle: {
    //   color: '#fff'
    // }
    // headerTitle: this.props.navigation.getParam()
  };

  refreshTimer=  null;

  state = {
    busInfo: {},
    pageInited: false,
    loading: true,
    isWatchOn: false,
    watchedUniqueKey: '',
    updataInterval: 30000,
  };
  componentDidMount() {
    let params = this.getParams();
    let watchedUniqueKey = encodeWatchUniqueKey(params);
    let isWatchOn;
    this.setState({
      watchedUniqueKey
    });
    storage.get(STORAGE_KEYS.WATCHED_ROUTES_BASIC_INFO).then(savedBasicInfo => {
      let savedBusInfo = savedBasicInfo || {};
      if (savedBusInfo[watchedUniqueKey]) {
        isWatchOn = true;
      } else {
        isWatchOn = false;
      }
      this.setState({
        isWatchOn
      });
    });
    this.updateBusInfo().then(() => {
      this.setState({
        pageInited: true
      })
    });
  }
  updateBusInfo = () => {
    if (this.state.pageInited && this.state.loading) {
      return;
    }
    if (!this.state.loading) {
      this.setState({
        loading: true
      });
    }

    let params = this.getParams();
    return getBusTimeInfo(params.lineId, params.dirId, params.stopSeq)
      .then(info => {
        if (info) {
          this.setState({
            busInfo: info
          });
        }
      })
      .finally(() => {
        this.setState({
          loading: false
        });
        this.refreshTimer = setTimeout(this.updateBusInfo, this.state.updataInterval)
      });
  }

  getParams() {
    let navigation = this.props.navigation;
    let params = navigation.state.params || {};
    return params;
  }
  getBasicBusInfo = () => {
    let { busInfo } = this.state;
    return {
      routeName: busInfo.routeName,
      curStopName: busInfo.curStopName,
      routeInfo: busInfo.routeInfo,
      query: this.getParams()
    };
  };
  makeAttention = async isAdd => {
    try {
      let { watchedUniqueKey } = this.state;
      let savedBasicInfo =
        (await storage.get(STORAGE_KEYS.WATCHED_ROUTES_BASIC_INFO)) || {};
      if (isAdd && !savedBasicInfo[watchedUniqueKey]) {
        savedBasicInfo[watchedUniqueKey] = this.getBasicBusInfo();
        this.setState({
          isWatchOn: true
        });
      } else if (!isAdd && savedBasicInfo[watchedUniqueKey]) {
        delete savedBasicInfo[watchedUniqueKey];
        this.setState({
          isWatchOn: false
        });
      } else {
        return true;
      }
      return await storage.save(
        STORAGE_KEYS.WATCHED_ROUTES_BASIC_INFO,
        savedBasicInfo
      );
    } catch (err) {
      console.error(err);
    }
  };
  handleDragDown = () => {
    if(this.state.loading) return;
    if(this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    this.updateBusInfo();
  }
  render() {
    let { busInfo = {}, pageInited, loading, isWatchOn } = this.state;
    let { busesArriving, busesOnTheWay } = busInfo;
    let getBusIcon = active => {
      if (active) {
        return (
          <Icon.Ionicons name="md-bus" style={styles.busIcon} color="#2f95dc" />
        );
      }
      if (active === false) {
        return <Icon.Ionicons name="md-bus" style={styles.busIcon} />;
      }
      if (active === null) {
        return (
          <Icon.Ionicons
            name="md-bus"
            style={[styles.busIcon, styles.inVisible]}
          />
        );
      }
    };
    let stopNames = Object.values(busInfo.stopSeqToName || {}) || [];
    return (
      <ScrollView  
        refreshControl={
          <RefreshControl 
            // tintColor="#2f95dc"
            colors={['#ff0000', '#00ff00', '#0000ff']}
            refreshing={loading}
            onRefresh={this.handleDragDown}/>
        }
      >
        {/* <ActivityIndicator animating={loading} size="large" /> */}
        {pageInited && (
          <View style={styles.container}>
            <View style={styles.desc1}>
              <View>
                <View style={styles.desc1Item}>
                  <Text>
                    {busInfo.routeName} {busInfo.routeInfo}
                  </Text>
                </View>
                <View style={styles.desc1Item}>
                  <Text>上车站点：{busInfo.curStopName}</Text>
                </View>
                <View style={styles.desc1Item}>
                  <Text>{busInfo.busRunTime}</Text>
                </View>
              </View>
              {!isWatchOn && (
                <Button
                  title="关注"
                  style={styles.btn}
                  onPress={() => this.makeAttention(true)}
                />
              )}
              {isWatchOn && (
                <Button
                  title="取消关注"
                  style={styles.btn}
                  onPress={() => this.makeAttention(false)}
                />
              )}
            </View>
            <View style={styles.desc2}>
              <Text>{busInfo.desc2}</Text>
            </View>
            <View style={styles.busDesc}>
              <View style={styles.busDescItem}>
                {getBusIcon(true)}
                <Text> 到站车辆</Text>
              </View>
              <View style={styles.busDescItem}>
                {getBusIcon(false)}
                <Text> 途中车辆</Text>
              </View>
            </View>

            <View style={styles.buses}>
              {stopNames.map((stopName, index) => {
                let stopSeq = index + 1 + '';
                let midStopSeq = index + 1.5 + '';
                let activedBus = busesArriving.includes(stopSeq);
                let midActivedBus = busesArriving.includes(midStopSeq);
                let inActivedBus = busesOnTheWay.includes(stopSeq);
                let midInActivedBus = busesOnTheWay.includes(midStopSeq);
                let busIcon = getBusIcon(
                  activedBus ? true : inActivedBus ? false : null
                );
                let midBusIcon = getBusIcon(
                  midActivedBus ? true : midInActivedBus ? false : null
                );
                return (
                  <View style={styles.busWrapper} key={index}>
                    <Text style={styles.bus}>
                      <Text style={styles.inVisible}> {stopName}</Text>
                      {busIcon}
                      <Text>&ensp;&ensp;</Text>
                      <Icon.Entypo name="circle" size={18} color="#aaa" />
                      <Text> {stopName}</Text>
                      <Text>&ensp;&ensp;</Text>
                      {getBusIcon(null)}
                    </Text>
                    {index < stopNames.length - 1 && (
                      <View style={styles.lineWrapper}>
                        {midBusIcon}
                        <View style={styles.line} />
                        {getBusIcon(null)}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  inVisible: {
    color: 'transparent'
  },
  activeColor: {
    color: tintColor
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  desc1: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  desc1Item: {
    marginBottom: 5,
    marginTop: 5
  },
  desc2: {
    marginBottom: 5,
    marginTop: 5
  },
  btn: {
    // pa
    height: 36,
    lineHeight: 36
  },
  busDesc: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5
  },
  busDescItem: {
    flex: 1,
    flexDirection: 'row'
    // justifyContent: 'flex-start',
    // alignItems: 'center',
  },
  busIcon: {
    fontSize: 18
  },
  buses: {
    flex: 1,
    marginTop: 20,
    marginLeft: -50,
    marginBottom: 30
  },
  busWrapper: {
    flex: 1,
    alignItems: 'center'
    // lineHeight: 0.9,
  },
  lineWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  // stopedBus: {
  //   padding: 10,
  // },
  bus: {

  },
  line: {
    height: 32,
    width: 2,
    backgroundColor: '#aaa',
  
    marginLeft: 23,
    marginRight: 23,
  }
});
