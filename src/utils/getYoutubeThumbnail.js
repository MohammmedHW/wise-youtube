// /src/utils/getYoutubeThumbnail.js

/**
 * Generates a YouTube thumbnail URL from a YouTube video ID.
 *
 * @param {string} videoId - The YouTube video ID.
 * @returns {string} The URL of the YouTube video thumbnail.
 */
const getYoutubeThumbnail = videoId => {
  if (!videoId) {
    throw new Error('A valid YouTube video ID must be provided');
  }

  // Construct the YouTube thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return thumbnailUrl;
};

export default getYoutubeThumbnail;
