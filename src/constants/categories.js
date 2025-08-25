export const CATEGORIES = {
  KIDS: {
    id: 'kids',
    name: 'Kids',
    subcategories: [
      {id: 'rhymes-songs', name: 'Rhymes & Songs'},
      {id: 'learning-abcs-123s', name: 'Learning ABCs & 123s'},
      {id: 'educational-cartoons', name: 'Educational Cartoons'},
      {id: 'science-for-kids', name: 'Science for Kids'},
      {id: 'math-tricks', name: 'Math Tricks'},
      {id: 'magic-shows', name: 'Magic Shows'},
      {id: 'art-craft', name: 'Art & Craft'},
      {id: 'toy-reviews', name: 'Toy Reviews'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  FOOD_RECIPES: {
    id: 'food-recipes',
    name: 'Food & Recipes',
    subcategories: [
      {id: 'indian-cooking', name: 'Indian Cooking'},
      {id: 'quick-snacks', name: 'Quick Snacks'},
      {id: 'desserts-baking', name: 'Desserts & Baking'},
      {id: 'street-food', name: 'Street Food'},
      {id: 'healthy-meals', name: 'Healthy Meals'},
      {id: 'festival-recipes', name: 'Festival Recipes'},
      {id: 'international-cuisine', name: 'International Cuisine'},
      {id: 'cooking-hacks', name: 'Cooking Hacks'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  MUSIC: {
    id: 'music',
    name: 'Music',
    subcategories: [
      {id: 'music-videos', name: 'Music Videos'},
      {id: 'classical-instrumental', name: 'Classical & Instrumental'},
      {id: 'devotional-music', name: 'Devotional Music'},
      {id: 'dj-remixes', name: 'DJ Remixes'},
      {id: 'karaoke', name: 'Karaoke'},
      {id: 'cover-songs', name: 'Cover Songs'},
      {id: 'live-performances', name: 'Live Performances'},
      {id: 'music-tutorials', name: 'Music Tutorials'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  NEWS_KNOWLEDGE: {
    id: 'news-knowledge',
    name: 'News & Knowledge',
    subcategories: [
      {id: 'world-news', name: 'World News'},
      {id: 'science-tech', name: 'Science & Tech'},
      {id: 'explainer-videos', name: 'Explainer Videos'},
      {id: 'social-issues', name: 'Social Issues'},
      {id: 'fact-checks', name: 'Fact Checks'},
      {id: 'environmental-awareness', name: 'Environmental Awareness'},
      {id: 'interviews', name: 'Interviews'},
      {id: 'current-affairs', name: 'Current Affairs'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  GAMING_SPORTS: {
    id: 'gaming-sports',
    name: 'Gaming & Sports',
    subcategories: [
      {id: 'lets-play', name: "Let's Play"},
      {id: 'game-reviews', name: 'Game Reviews'},
      {id: 'mobile-gaming', name: 'Mobile Gaming'},
      {id: 'walkthroughs', name: 'Walkthroughs'},
      {id: 'minecraft-roblox', name: 'Minecraft / Roblox'},
      {id: 'sports-tournaments', name: 'Sports & Tournaments'},
      {id: 'sports-highlights', name: 'Sports Highlights'},
      {id: 'game-tutorials', name: 'Game Tutorials'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  ART_DIY: {
    id: 'art-diy',
    name: 'Art & DIY',
    subcategories: [
      {id: 'drawing-sketching', name: 'Drawing & Sketching'},
      {id: 'craft-recyclables', name: 'Craft from Recyclables'},
      {id: 'home-decor-ideas', name: 'Home Decor Ideas'},
      {id: 'painting-techniques', name: 'Painting Techniques'},
      {id: 'origami', name: 'Origami'},
      {id: 'clay-modeling', name: 'Clay Modeling'},
      {id: 'fashion-diy', name: 'Fashion DIY'},
      {id: 'photography-tips', name: 'Photography Tips'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  TECHNOLOGY: {
    id: 'technology',
    name: 'Technology',
    subcategories: [
      {id: 'mobile-reviews', name: 'Mobile Reviews'},
      {id: 'gadget-unboxing', name: 'Gadget Unboxing'},
      {id: 'software-tutorials', name: 'Software Tutorials'},
      {id: 'tech-news', name: 'Tech News'},
      {id: 'coding-tips', name: 'Coding Tips'},
      {id: 'robotics-ai', name: 'Robotics & AI'},
      {id: 'smart-home-demos', name: 'Smart Home Demos'},
      {id: 'pc-builds', name: 'PC Builds'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  EDUCATION: {
    id: 'education',
    name: 'Education',
    subcategories: [
      {id: 'science-basics', name: 'Science Basics'},
      {id: 'math-tricks', name: 'Math Tricks'},
      {id: 'history-geography', name: 'History & Geography'},
      {id: 'language-learning', name: 'Language Learning'},
      {id: 'study-motivation', name: 'Study Motivation'},
      {id: 'exam-prep', name: 'Exam Prep'},
      {id: 'documentaries', name: 'Documentaries'},
      {id: 'career-tips', name: 'Career Tips'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  BEAUTY_WELLNESS: {
    id: 'beauty-wellness',
    name: 'Beauty & Wellness',
    subcategories: [
      {id: 'yoga', name: 'Yoga'},
      {id: 'meditation', name: 'Meditation'},
      {id: 'full-body-workouts', name: 'Full Body Workouts'},
      {id: 'nutrition-tips', name: 'Nutrition Tips'},
      {id: 'mental-wellness', name: 'Mental Wellness'},
      {id: 'skin-hair-care', name: 'Skin & Hair Care'},
      {id: 'home-remedies', name: 'Home Remedies'},
      {id: 'daily-fitness-routines', name: 'Daily Fitness Routines'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  ENTERTAINMENT: {
    id: 'entertainment',
    name: 'Entertainment',
    subcategories: [
      {id: 'comedy-skits', name: 'Comedy Skits'},
      {id: 'movie-trailers', name: 'Movie Trailers'},
      {id: 'short-films', name: 'Short Films'},
      {id: 'web-series-clips', name: 'Web Series Clips'},
      {id: 'vlogs', name: 'Vlogs'},
      {id: 'reaction-videos', name: 'Reaction Videos'},
      {id: 'talk-shows', name: 'Talk Shows'},
      {id: 'magic-shows', name: 'Magic Shows'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  TRAVEL_VLOGS: {
    id: 'travel-vlogs',
    name: 'Travel & Vlogs',
    subcategories: [
      {id: 'travel-diaries', name: 'Travel Diaries'},
      {id: 'daily-routines', name: 'Daily Routines'},
      {id: 'personal-stories', name: 'Personal Stories'},
      {id: 'home-lifestyle', name: 'Home & Lifestyle'},
      {id: 'minimalism', name: 'Minimalism'},
      {id: 'budgeting-tips', name: 'Budgeting Tips'},
      {id: 'fashion-style', name: 'Fashion & Style'},
      {id: 'life-advice', name: 'Life Advice'},
      // {id: 'all-other', name: 'All Other'},
    ],
  },

  ALL_OTHER: {
    id: 'all-other',
    name: 'All Other',
    subcategories: [{id: 'search-keywords', name: 'Search Using Keywords'}],
  },
};

// Helper function to get all categories as an array
export const getCategoriesArray = () => {
  return Object.values(CATEGORIES);
};

// Helper function to get category by id
export const getCategoryById = id => {
  return Object.values(CATEGORIES).find(category => category.id === id);
};

// Helper function to get subcategory by category id and subcategory id
export const getSubcategoryById = (categoryId, subcategoryId) => {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

// Helper function to get all subcategories for a category
export const getSubcategoriesByCategoryId = categoryId => {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
};

// Main categories for homepage display
export const MAIN_CATEGORIES = [
  'kids',
  'food-recipes',
  'music',
  'news-knowledge',
  'gaming-sports',
  'art-diy',
  'technology',
  'education',
  'beauty-wellness',
  'entertainment',
  'travel-vlogs',
  'all-other',
];
