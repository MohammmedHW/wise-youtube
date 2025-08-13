export const config = {
  cli: {
    url: 'http://timesride.com/custom',
    base_url: 'https://youtube.googleapis.com/youtube/v3',
    api_key: 'AIzaSyAt0lZj0hUePz1K3KjLFTP_If3mZdXiGlw',
  },
};

export const categoriesConfig = {
  categories: {
    kids: {
      id: 1,
      name: 'Kids',
      subcategories: [
        'Rhymes & Songs',
        'Learning ABCs & 123s',
        'Educational Cartoons',
        'Science for Kids',
        'Math Tricks',
        'Magic Shows',
        'Art & Craft',
        'Toy Reviews',
        'All Other',
      ],
    },
    foodRecipes: {
      id: 2,
      name: 'Food & Recipes',
      subcategories: [
        'Indian Cooking',
        'Quick Snacks',
        'Desserts & Baking',
        'Street Food',
        'Healthy Meals',
        'Festival Recipes',
        'International Cuisine',
        'Cooking Hacks',
        'All Other',
      ],
    },
    music: {
      id: 3,
      name: 'Music',
      subcategories: [
        'Music Videos',
        'Classical & Instrumental',
        'Devotional Music',
        'DJ Remixes',
        'Karaoke',
        'Cover Songs',
        'Live Performances',
        'Music Tutorials',
        'All Other',
      ],
    },
    newsKnowledge: {
      id: 4,
      name: 'News & Knowledge',
      subcategories: [
        'World News',
        'Science & Tech',
        'Explainer Videos',
        'Social Issues',
        'Fact Checks',
        'Environmental Awareness',
        'Interviews',
        'Current Affairs',
        'All Other',
      ],
    },
    gamingSports: {
      id: 5,
      name: 'Gaming & Sports',
      subcategories: [
        "Let's Play",
        'Game Reviews',
        'Mobile Gaming',
        'Walkthroughs',
        'Minecraft / Roblox',
        'Sports & Tournaments',
        'Sports Highlights',
        'Game Tutorials',
        'All Other',
      ],
    },
    artDIY: {
      id: 6,
      name: 'Art & DIY',
      subcategories: [
        'Drawing & Sketching',
        'Craft from Recyclables',
        'Home Decor Ideas',
        'Painting Techniques',
        'Origami',
        'Clay Modeling',
        'Fashion DIY',
        'Photography Tips',
        'All Other',
      ],
    },
    technology: {
      id: 7,
      name: 'Technology',
      subcategories: [
        'Mobile Reviews',
        'Gadget Unboxing',
        'Software Tutorials',
        'Tech News',
        'Coding Tips',
        'Robotics & AI',
        'Smart Home Demos',
        'PC Builds',
        'All Other',
      ],
    },
    education: {
      id: 8,
      name: 'Education',
      subcategories: [
        'Science Basics',
        'Math Tricks',
        'History & Geography',
        'Language Learning',
        'Study Motivation',
        'Exam Prep',
        'Documentaries',
        'Career Tips',
        'All Other',
      ],
    },
    beautyWellness: {
      id: 9,
      name: 'Beauty & Wellness',
      subcategories: [
        'Yoga',
        'Meditation',
        'Full Body Workouts',
        'Nutrition Tips',
        'Mental Wellness',
        'Skin & Hair Care',
        'Home Remedies',
        'Daily Fitness Routines',
        'All Other',
      ],
    },
    entertainment: {
      id: 10,
      name: 'Entertainment',
      subcategories: [
        'Comedy Skits',
        'Movie Trailers',
        'Short Films',
        'Web Series Clips',
        'Vlogs',
        'Reaction Videos',
        'Talk Shows',
        'Magic Shows',
        'All Other',
      ],
    },
    travelVlogs: {
      id: 11,
      name: 'Travel & Vlogs',
      subcategories: [
        'Travel Diaries',
        'Daily Routines',
        'Personal Stories',
        'Home & Lifestyle',
        'Minimalism',
        'Budgeting Tips',
        'Fashion & Style',
        'Life Advice',
        'All Other',
      ],
    },
    allOther: {
      id: 12,
      name: 'All Other',
      subcategories: ['Search Using Keywords'],
    },
  },

  // Helper function to get all categories as array
  getCategoriesArray: function () {
    return Object.values(this.categories);
  },

  // Helper function to get category by id
  getCategoryById: function (id) {
    return Object.values(this.categories).find(cat => cat.id === id);
  },

  // Helper function to get category by name
  getCategoryByName: function (name) {
    return Object.values(this.categories).find(cat => cat.name === name);
  },

  // Helper function to get subcategories by category ID
  getSubcategoriesById: function (id) {
    const category = this.getCategoryById(id);
    return category ? category.subcategories : [];
  },

  // Helper function to get subcategories by category name
  getSubcategoriesByName: function (name) {
    const category = this.getCategoryByName(name);
    return category ? category.subcategories : [];
  },

  // Helper function to get subcategories by category key
  getSubcategoriesByKey: function (key) {
    const category = this.categories[key];
    return category ? category.subcategories : [];
  },
};
