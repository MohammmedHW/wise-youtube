import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import {Card, Title} from 'react-native-paper';

const ChannelVideo = ({route}) => {
  const {videos} = route.params;
  // console.log(route, "route")

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.channelName}>Channel Name</Text> */}
      {videos.map((video, index) => (
        <Card key={index} style={styles.card}>
          <YoutubePlayer
            height={220}
            play={false}
            videoId={video.id.videoId}
            webViewStyle={styles.webViewStyle}
          />
          <View style={styles.videoInfoContainer}>
            <Title style={styles.videoTitle}>{video.snippet.title}</Title>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  channelName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    marginBottom: 10,
  },
  webViewStyle: {
    alignSelf: 'stretch',
  },
  videoInfoContainer: {
    padding: 10,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666666',
  },
});

export default ChannelVideo;
