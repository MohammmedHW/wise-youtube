import {endpoints} from './endpoints';
import axios from 'axios';

const createUSer = (token, body) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${endpoints.users.createUSer}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
const getAllUSerByParents = token =>
  new Promise((resolve, reject) => {
    axios
      .get(`${endpoints.users.getAllUsers}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
const getUserDetails = (token, userId) =>
  new Promise((resolve, reject) => {
    axios
      .get(`${endpoints.users.getUserDetails}/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
const alotPlaylistToUser = (token, body, userId) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${endpoints.users.addPlaylistToUser}/${userId}`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
const removePlaylistFromUser = (token, userId, playlistId) =>
  new Promise((resolve, reject) => {
    axios
      .put(
        `${endpoints.users.removePlaylistFromUser}/${userId}/userTypePlayList/${playlistId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        },
      )
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
const deleteUser = (token, userId) =>
  new Promise((resolve, reject) => {
    axios
      .delete(`${endpoints.users.deleteUser}/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });

const forgotPassword = body =>
  new Promise((resolve, reject) => {
    axios
      .post(`${endpoints.users.forgotPassword}`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });

const forgotPasswordSave = body =>
  new Promise((resolve, reject) => {
    axios
      .post(`${endpoints.users.forgotPasswordSave}`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });

export {
  createUSer,
  getAllUSerByParents,
  getUserDetails,
  alotPlaylistToUser,
  removePlaylistFromUser,
  deleteUser,
  forgotPassword,
  forgotPasswordSave,
};
