import { endpoints } from './endpoints';
import axios from 'axios';

const addVideoToPlaylist = (token, body) =>
    new Promise((resolve, reject) => {
        axios
            .post(`${endpoints.video.addVideos}`, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

const getAllVideos = (token) =>
    new Promise((resolve, reject) => {
        axios
            .get(`${endpoints.video.getAllVideos}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });


const getVideosByPlaylist = (token, id) =>
    new Promise((resolve, reject) => {
        axios
            .get(`${endpoints.video.getVideosByPlaylist}/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });
const deleteVideo = (token, id, playlistId) =>
    new Promise((resolve, reject) => {
        axios
            .delete(`${endpoints.video.deleteVideo}/${id}?paylistId=${playlistId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
            })
            .then((response) => resolve(response.data))
            .catch((error) => reject(error));
    });

export {
    addVideoToPlaylist,
    getAllVideos,
    getVideosByPlaylist,
    deleteVideo,
}