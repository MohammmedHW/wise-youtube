import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
  Easing,
} from 'react-native';
import {Video} from '../../services';
import SortableList from 'react-native-sortable-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Card, Title} from 'react-native-paper';
import getYoutubeThumbnail from '../../utils/getYoutubeThumbnail';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const ParentViewScreen = ({route, hidePlayAllBtn = true}) => {
  const navigation = useNavigation();
  const clickedPlaylistId = route.params.id;
  const [videos, setVideos] = useState([]);
  const [videosList, setVideosList] = useState([]);

  useEffect(() => {
    fetchPlaylistData();
    console.log(clickedPlaylistId, 'clickedPlaylistId');
  }, [clickedPlaylistId]);

  const fetchPlaylistData = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await Video.getVideosByPlaylist(
        token,
        clickedPlaylistId,
      );
      setVideos(response.data.video);
      const videoList = [];
      response.data.video.forEach(element => {
        videoList.push(getYouTubeVideoId(element.videoUrl));
      });
      setVideosList(videoList);
      // console.log(videoList, 'videoList');
      // setVideosLength(response.data.video.length);
    } catch (error) {
      console.error('Error fetching playlist data:', error);
      Alert.alert('Error', 'Failed to fetch playlist data');
    }
  };

  const handlerRedirect = () => {
    console.log(route);
    navigation.navigate('Playlist', {
      videoId: videosList,
      id: clickedPlaylistId,
    });
  };

  // const handlerPlay = videosId => {
  //   console.log(videosId,videos)
  //   // const CurrIndex = videos.findIndex(el =>{
  //   //   console.log(el._id,videosId,"fgfgfgfgfgfg")
  //   //   return el._id === videosId});
  //   // const videoList = [];
  //   // console.log(CurrIndex)
  //   // videos.forEach((element, index) => {
  //   //   if (index >= CurrIndex) {
  //   //     videoList.push(getYouTubeVideoId(element.videoUrl));
  //   //   }
  //   // });
  //   // console.log(videoList.length)
  //   // if (videoList.length > 0) {
  //   //   navigation.navigate('Playlist', {
  //   //     videoId: videoList,
  //   //     id: clickedPlaylistId,
  //   //   });
  //   // }
  // };

  const handlerPlay = useCallback(
    videosId => {
      console.log("first")
      const CurrIndex = videos.findIndex(el => {
        return el._id === videosId;
      });
      const videoList = [];

      videos.forEach((element, index) => {
        if (index >= CurrIndex) {
          videoList.push(getYouTubeVideoId(element.videoUrl));
        }
      });
      if (videoList.length > 0) {
        navigation.navigate('Playlist', {
          videoId: videoList,
          id: clickedPlaylistId,
        });
      }
    },
    [videos],
  );

  const renderRow = useCallback(
    ({data, active}) => {
      return <Row data={data} active={active} onPlay={handlerPlay} />;
    },
    [videos],
  );

  return (
    <View style={styles.container}>
      {hidePlayAllBtn && (
        <View style={styles.buttonView}>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={handlerRedirect}>
              <View style={styles.align}>
                <IonIcons name="play" color="black" size={25} />
                <Text style={styles.btnText}>PLAY ALL</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <SortableList
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        data={videos}
        renderRow={renderRow}
      />
    </View>
  );
};

const getYouTubeVideoId = url => {
  const videoIdRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(videoIdRegex);
  return match ? match[1] : '';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  videoInfoContainer: {
    padding: 8,
    paddingTop: 0,
    width: '70%',
  },
  videoName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  buttonView: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    marginBottom: 10,
  },
  buttons: {
    overflow: 'hidden',
    width: '50%',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
  },
  align: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  row: {},
});

export default ParentViewScreen;

function Row(props) {
  const {active, data, onPlay} = props;
  const thumbnailUrl = getYoutubeThumbnail(getYouTubeVideoId(data.videoUrl));
  const activeAnim = useRef(new Animated.Value(0));
  const style = useMemo(
    () => ({
      ...Platform.select({
        ios: {
          transform: [
            {
              scale: activeAnim.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          shadowRadius: activeAnim.current.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [
            {
              scale: activeAnim.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            },
          ],
          elevation: activeAnim.current.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),
    }),
    [],
  );
  useEffect(() => {
    Animated.timing(activeAnim.current, {
      duration: 300,
      easing: Easing.bounce,
      toValue: Number(active),
      useNativeDriver: true,
    }).start();
  }, [active]);

  return (
    <Animated.View style={[styles.row, style]}>
      <View>
        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <IonIcons name="reorder-two-outline" color="black" size={25} />
            <Image
              source={{uri: thumbnailUrl}}
              style={{width: 80, height: 80, resizeMode: 'cover'}}
            />
              <View style={styles.videoInfoContainer}>
            <TouchableOpacity onPress={() => onPlay(data._id)}>
                <Text style={styles.videoName}>{data.videoName}</Text>
            </TouchableOpacity>
              </View>
          </View>
        </Card>
      </View>
    </Animated.View>
  );
}
