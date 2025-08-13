import {endpoints} from './endpoints';
import axios from 'axios';

const createPlaylist = body =>
  new Promise((resolve, reject) => {
    axios
      .post(`${endpoints.playlist.createPlaylist}`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });

const getAllPlaylist = email =>
  new Promise((resolve, reject) => {
    axios
      .get(`${endpoints.playlist.getPlaylist}?email_id=${email}`, {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })

      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });

const addToPlaylist = body =>
  new Promise((resolve, reject) => {
    axios
      .post(`${endpoints.playlist.addToPlaylist}`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
const getPlaylistDetails = ({email_id, playlist_id}) =>
  new Promise((resolve, reject) => {
    axios
      .get(
        `${endpoints.playlist.getPlaylistDetails}?email_id=${email_id}&playlist_id=${playlist_id}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });

export {createPlaylist, getAllPlaylist, addToPlaylist, getPlaylistDetails};
