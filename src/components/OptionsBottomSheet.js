import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppFonts from '../utils/AppFonts';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

const OptionsBottomSheet = ({
  sheetRef,
  fetchPlaylists,
  openPlaylistSheet,
  selectedVideoId,
}) => {
  // SHARE
  const handleShare = async () => {
    try {
      await Share.open({
        message: 'Check out this video!',
        url: `https://www.youtube.com/watch?v=${selectedVideoId}`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'This app needs access to your storage to download videos.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true; // iOS doesn't need this
    }
  };

  // DOWNLOAD
  const handleDownload = async () => {
    try {
      const granted = await requestStoragePermission();

      const fileName = `video-${Date.now()}.mp4`;
      const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // NOTE: This is a placeholder. YouTube videos can't be directly downloaded like this.
      const downloadableUrl = `https://www.youtube.com/watch?v=${selectedVideoId}`;

      const res = await RNFS.downloadFile({
        fromUrl: downloadableUrl,
        toFile: downloadDest,
      }).promise;

      if (res.statusCode === 200) {
        Alert.alert('Success', 'Video downloaded successfully!');
      } else {
        Alert.alert('Error', 'Failed to download video.');
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert(
        'Error',
        'Download failed. YouTube URLs may require third-party processing.',
      );
    }
  };

  return (
    <RBSheet
      ref={sheetRef}
      closeOnPressMask={true}
      height={100}
      customStyles={{
        container: {
          padding: 10,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          backgroundColor: 'white',
        },
      }}>
      
    </RBSheet>
  );
};

export default OptionsBottomSheet;
