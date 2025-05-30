import {config} from '../../config';

const url = config.cli.url;
// const BASE_URL = 'https://youtube-v31.p.rapidapi.com';
const BASE_URL = config.cli.base_url;
const API_KEY = config.cli.api_key;

export const endpoints = {
  auth: {
    login: `${url}/LoginpageAPI.php`, //admin,,,,parent
    register: `${url}/LoginpageAPI.php`,
    generateOtp: `${url}/VerificationOtpAPI.php`,
    verifyOtp: `${url}/verifiedOTP.php`,
    userLogin: `${url}/api/userType/login`, //user,,,child
  },
  users: {
    createUSer: `${url}/api/user/addUser`,
    addPlaylistToUser: `${url}/api/playlist/allotPlayList`,
    removePlaylistFromUser: `${url}/api/playlist/deleteUserTypePlaylist`,
    deleteUser: `${url}/api/user/deleteUser`,
    getAllUsers: `${url}/api/usersByAdminId`,
    getUserDetails: `${url}/api/userTypeDetail`,
    forgotPassword: `${url}/api/forgetPasswordMail`,
    forgotPasswordSave: `${url}/setPassword.php`,
  },
  playlist: {
    createPlaylist: `${url}/creatPlayList.php`,
    getPlaylist: `${url}/getPlayList.php`,
    getPlaylistDetails: `${url}/getPlayList.php`,
    addToPlaylist: `${url}/addToPlayList.php`,
  },
  video: {
    addVideos: `${url}/api/video/uploadData`,
    getAllVideos: `${url}/api/video`,
    deleteVideo: `${url}/api/video/delete`,
    getVideosByPlaylist: `${url}/api/video/getData`,
  },
  youtubeApi: {
    search: `${BASE_URL}/search?key=${API_KEY}&part=snippet&q=`,
    getVideoDetails: `${BASE_URL}/videos?key=${API_KEY}&part=snippet,statistics&id=`,
    getRelatedVideos: `${BASE_URL}/search?key=${API_KEY}&part=snippet&id=`,
    getChannelById: `${BASE_URL}/channels?key=${API_KEY}`,
    getVideosByChannelId: `${BASE_URL}/search?key=${API_KEY}&part=snippet&id=`,
  },
  subscription: {
    getPlans: `${url}/api/subscription/getPlans`,
    placeOrder: `${url}/api/payment/placeOrder`,
  },
  channel: {
    addChannel: `${url}/api/channel/addChannel`,
    getChannelList: `${url}/api/channel/getChannels`,
    getChannelByUserId: `${url}/api/channel/getChannels`,
    alotChannelToUser: `${url}/api/channel/allotChannel`,
    removeAlotChannelToUser: `${url}/api/channel/removeallotedChannel`,
    deleteChannel: `${url}/api/channel/deleteChannel`,
  },
};
