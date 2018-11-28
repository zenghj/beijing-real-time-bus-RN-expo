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
  
  componentDidMount() {
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
    dirSelectEnabled: false,
    stations: [],
    stopSeq: '',
    stationSelectEnabled: false,

  };
  clearDirSelect = () => {
    this.setState({
      dirs: [],
      dirId: '',
      dirSelectEnabled: false,
    })
  }
  clearStationSelect = () => {
    this.setState({
      stations: [],
      stopSeq: '',
      stationSelectEnabled: false,
    })
  }
  handleLineIdChange = (lineId) => {
    this.setState({
      lineId,
    })
    this.clearDirSelect();
    this.clearStationSelect();

    lineId && getBusDirList(lineId).then(list => {
      this.setState({
        dirs: list || [],
        dirSelectEnabled: true,
      })
    }, (err) => {console.error(err)})
  }
  handleDirIdChange = (dirId) => {
    this.setState({
      dirId,
    })
    this.clearStationSelect();
    dirId && getBusDirStationList(this.state.lineId, dirId).then(list => {
      this.setState({
        stations: list || [],
        stationSelectEnabled: true,
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
    this.props.navigation.navigate({
      routeName: 'BusInfo',
      params: {
        lineId,
        dirId,
        stopSeq,
      }
    });
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
              enabled={this.state.dirSelectEnabled}
              style={[styles.picker, !this.state.dirSelectEnabled ? styles.disabled : {}]}
              mode="dropdown"
              selectedValue={this.state.dirId}
              onValueChange={this.handleDirIdChange}
            >
              <Picker.Item itemStyle={styles.placeholder}  label="请选择路线方向" value="" />
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
              enabled={this.state.stationSelectEnabled}
              style={[styles.picker, !this.state.stationSelectEnabled ? styles.disabled : {}]}
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
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
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
});
