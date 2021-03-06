import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import BusInfoScreen from '../screens/BusInfoScreen';
import MyWatchListScreen from '../screens/MyWatchListScreen';


const HomeStack = createStackNavigator({
  Home: HomeScreen,
  BusInfo: BusInfoScreen,
});

HomeStack.navigationOptions = ({navigation}) => {
  return {
    tabBarVisible: navigation.state.index === 0,
    tabBarLabel: '首页',
    tabBarIcon: ({ focused }) => (
      <TabBarIcon
        focused={focused}
        name="md-home"
      />
    ),
    // defaultNavigationOptions: {
    //   headerStyle: {
    //     backgroundColor: '#000'
    //   },
    //   headerTitleStyle: {
    //     color: '#fff'
    //   }
    // }
  };
}


const MyWatchListStack = createStackNavigator({
  Settings: MyWatchListScreen,
});

MyWatchListStack.navigationOptions = {
  tabBarLabel: '我的关注',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name="md-person"
    />
  ),
};

const TabNavigator = createBottomTabNavigator({
  HomeStack,
  // LinksStack,
  MyWatchListStack,
});

export default TabNavigator;

// export default createStackNavigator({
//   Tabs: TabNavigator,
//   BusInfo: BusInfoScreen,
// })
