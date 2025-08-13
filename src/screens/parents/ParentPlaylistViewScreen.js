import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import ParentViewScreen from './ParentViewScreen';

function ParentPlaylistViewScreen({route}) {
  const playerRef = useRef(null);
  return (
    <View style={{flex: 1, backgroundColor: '#e5e5e5'}}>
      <View>
        <YoutubePlayer
          ref={playerRef}
          height={230}
          play={true}
          forceAndroidAutoplay={true}
          playList={route.params.videoId}
          webViewProps={{
            setSupportMultipleWindows: false,
          }}
        />
      </View>
      <ParentViewScreen route={route} hidePlayAllBtn={false} />
    </View>
  );
}

export default ParentPlaylistViewScreen;
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
  },
  dropdown: {
    width: '70%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
