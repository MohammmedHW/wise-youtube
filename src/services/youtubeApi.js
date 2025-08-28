import getLocaleInfo from '../utils/getLocaleInfo';
import {endpoints} from './endpoints';
import axios from 'axios';

const options = {
  params: {
    maxResults: 50,
  },
  headers: {
    headers: {
      Accept: 'application/json',
    },
  },
};
const options2 = {
  params: {
    maxResults: 10,
  },
  headers: {
    headers: {
      Accept: 'application/json',
    },
  },
};
const getVideosBySearch = (search, pageToken = '', type = 'video') => {
  const {regionCode, languageCode} = getLocaleInfo();

  const params = {
    maxResults: 50,
    type: type === 'short' ? 'video' : type === 'live' ? 'video' : type,
    safeSearch: 'moderate',
    pageToken,
    part: 'snippet',
    q: search || '',
  };

  // Only add live filter when needed
  if (type === 'live') {
    params.eventType = 'live';
  }

  return new Promise((resolve, reject) => {
    axios
      .get(
        `${endpoints.youtubeApi.search}${encodeURIComponent(search || '')}`,
        {
          params,
          headers: {
            Accept: 'application/json',
          },
        },
      )
      .then(response => {
        // For shorts: filter manually (by title or heuristics)
        if (type === 'short') {
          const shorts = response.data.items.filter(item => {
            const title = item.snippet.title.toLowerCase();
            return (
              title.includes('short') ||
              item.snippet?.description?.toLowerCase().includes('short') ||
              item.id.kind === 'youtube#video'
            );
          });
          resolve({...response.data, items: shorts});
        } else {
					// console.log("TCL: getVideosBySearch -> response.data", JSON.stringify(response.data))

          resolve(response.data);
        }
      })
      .catch(error => reject(error));
  });
};

const getRelatedVideos = id => {
  const {regionCode, languageCode} = getLocaleInfo();

  return new Promise((resolve, reject) => {
    axios
      .get(`${endpoints.youtubeApi.getRelatedVideos}`, {
        params: {
          type: 'video',
          id: id,
          regionCode,
          relevanceLanguage: languageCode,
        },
        headers: {
          Accept: 'application/json',
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
};

const getChannelDetailsByIds = ids => {
  const {regionCode, languageCode} = getLocaleInfo();

  return new Promise((resolve, reject) => {
    axios
      .get(`${endpoints.youtubeApi.getChannelById}`, {
        params: {
          part: 'snippet',
          id: ids,
          regionCode,
          relevanceLanguage: languageCode,
        },
        headers: {
          Accept: 'application/json',
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
};

const getVideosByChannelId = id => {
  const {regionCode, languageCode} = getLocaleInfo();

  return new Promise((resolve, reject) => {
    axios
      .get(`${endpoints.youtubeApi.getVideosByChannelId}${id}`, {
        params: {
          part: 'snippet',
          regionCode,
          relevanceLanguage: languageCode,
          maxResults: 50,
          type: 'video',
        },
        headers: {
          Accept: 'application/json',
        },
      })
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });
};

const getVideoDetails = id =>
  new Promise((resolve, reject) => {
    axios
      .get(`${endpoints.youtubeApi.getVideoDetails}${id}`, options)
      .then(response => resolve(response.data))
      .catch(error => reject(error));
  });

export {
  getVideosBySearch,
  getVideoDetails,
  getRelatedVideos,
  getVideosByChannelId,
  getChannelDetailsByIds,
};
