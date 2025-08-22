import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import AppFonts from '../utils/AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 3;

function CategoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {categoryId, categoryName, subcategories} = route.params;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSubcategoryPress = subcategory => {
    navigation.navigate('ParentHomeScreen', {
      categoryId,
      categoryName,
      subcategoryId: subcategory.id,
      subcategoryName: subcategory.name,
    });
  };

  const getSubcategoryIcon = (subcategoryId, categoryId) => {
    const iconMap = {
      // Kids subcategories
      'rhymes-songs': 'music-note',
      'learning-abcs-123s': 'school',
      'educational-cartoons': 'tv',
      'science-for-kids': 'science',
      'math-tricks': 'calculate',
      'magic-shows': 'auto-fix-high',
      'art-craft': 'palette',
      'toy-reviews': 'toys',

      // Food & Recipes
      'indian-cooking': 'restaurant',
      'quick-snacks': 'fastfood',
      'desserts-baking': 'cake',
      'street-food': 'food-truck',
      'healthy-meals': 'eco',
      'festival-recipes': 'celebration',
      'international-cuisine': 'public',
      'cooking-hacks': 'tips-and-updates',

      // Music
      'music-videos': 'music-video',
      'classical-instrumental': 'piano',
      'devotional-music': 'favorite',
      'dj-remixes': 'queue-music',
      karaoke: 'mic',
      'cover-songs': 'library-music',
      'live-performances': 'live-tv',
      'music-tutorials': 'music-note',

      // News & Knowledge
      'world-news': 'public',
      'science-tech': 'computer',
      'explainer-videos': 'lightbulb',
      'social-issues': 'groups',
      'fact-checks': 'fact-check',
      'environmental-awareness': 'eco',
      interviews: 'record-voice-over',
      'current-affairs': 'newspaper',

      // Gaming & Sports
      'lets-play': 'sports-esports',
      'game-reviews': 'rate-review',
      'mobile-gaming': 'phone-android',
      walkthroughs: 'map',
      'minecraft-roblox': 'games',
      'sports-tournaments': 'emoji-events',
      'sports-highlights': 'highlight',
      'game-tutorials': 'school',

      // Art & DIY
      'drawing-sketching': 'brush',
      'craft-recyclables': 'recycling',
      'home-decor-ideas': 'home',
      'painting-techniques': 'palette',
      origami: 'auto-awesome',
      'clay-modeling': 'sculpture',
      'fashion-diy': 'checkroom',
      'photography-tips': 'camera-alt',

      // Technology
      'mobile-reviews': 'smartphone',
      'gadget-unboxing': 'inventory',
      'software-tutorials': 'computer',
      'tech-news': 'feed',
      'coding-tips': 'code',
      'robotics-ai': 'smart-toy',
      'smart-home-demos': 'home-work',
      'pc-builds': 'memory',

      // Education
      'science-basics': 'science',
      'history-geography': 'public',
      'language-learning': 'translate',
      'study-motivation': 'psychology',
      'exam-prep': 'quiz',
      documentaries: 'movie',
      'career-tips': 'work',

      // Beauty & Wellness
      yoga: 'self-improvement',
      meditation: 'spa',
      'full-body-workouts': 'fitness-center',
      'nutrition-tips': 'restaurant-menu',
      'mental-wellness': 'psychology',
      'skin-hair-care': 'face',
      'home-remedies': 'healing',
      'daily-fitness-routines': 'directions-run',

      // Entertainment
      'comedy-skits': 'theater-comedy',
      'movie-trailers': 'movie',
      'short-films': 'videocam',
      'web-series-clips': 'tv',
      vlogs: 'video-camera-front',
      'reaction-videos': 'sentiment-very-satisfied',
      'talk-shows': 'record-voice-over',

      // Travel & Vlogs
      'travel-diaries': 'flight',
      'daily-routines': 'schedule',
      'personal-stories': 'person',
      'home-lifestyle': 'home',
      minimalism: 'minimize',
      'budgeting-tips': 'savings',
      'fashion-style': 'checkroom',
      'life-advice': 'psychology',

      'all-other': 'apps',
    };

    return iconMap[subcategoryId] || 'play-circle-outline';
  };

  const getSubcategoryGradient = (index, categoryId) => {
    const gradientSchemes = {
      kids: [
        ['#FF6B35', '#E55100'],
        ['#F7931E', '#FF8F00'],
        ['#4A90E2', '#2196F3'],
        ['#27AE60', '#2ECC71'],
        ['#8E44AD', '#9B59B6'],
        ['#E67E22', '#F39C12'],
        ['#E74C3C', '#C0392B'],
        ['#16A085', '#1ABC9C'],
        ['#D35400', '#E67E22'],
      ],
      'food-recipes': [
        ['#FF4500', '#FF6347'],
        ['#DC143C', '#B22222'],
        ['#228B22', '#32CD32'],
        ['#FFA500', '#FF8C00'],
        ['#C71585', '#FF1493'],
        ['#008B8B', '#20B2AA'],
        ['#FF8C00', '#FFA500'],
        ['#FF0000', '#FF4500'],
        ['#00FF00', '#32CD32'],
      ],
      music: [
        ['#9370DB', '#8A2BE2'],
        ['#8A2BE2', '#9370DB'],
        ['#BA55D3', '#DA70D6'],
        ['#DA70D6', '#DDA0DD'],
        ['#9932CC', '#BA55D3'],
        ['#8B008B', '#9370DB'],
        ['#6A1B9A', '#8A2BE2'],
        ['#EE82EE', '#DA70D6'],
        ['#FF00FF', '#8B008B'],
      ],
      'news-knowledge': [
        ['#FF3B30', '#DC143C'],
        ['#FF6347', '#CD5C5C'],
        ['#DC143C', '#B22222'],
        ['#B22222', '#8B0000'],
        ['#CD5C5C', '#A0522D'],
        ['#F08080', '#FA8072'],
        ['#FA8072', '#E9967A'],
        ['#E9967A', '#DEB887'],
        ['#FFA07A', '#FF7F50'],
      ],
      'gaming-sports': [
        ['#34C759', '#2E7D32'],
        ['#32CD32', '#228B22'],
        ['#00FF00', '#32CD32'],
        ['#7FFF00', '#9ACD32'],
        ['#ADFF2F', '#9ACD32'],
        ['#9AFF9A', '#90EE90'],
        ['#90EE90', '#98FB98'],
        ['#98FB98', '#90EE90'],
        ['#00FA9A', '#00FF7F'],
      ],
      'art-diy': [
        ['#FF9500', '#FF8C00'],
        ['#FFA500', '#FF8C00'],
        ['#FF8C00', '#FF7F00'],
        ['#FFB347', '#FFA500'],
        ['#FFCC99', '#DEB887'],
        ['#FFDAB9', '#F5DEB3'],
        ['#FFEFD5', '#FFE4B5'],
        ['#FFE4B5', '#DEB887'],
        ['#F5DEB3', '#D2B48C'],
      ],
      technology: [
        ['#007AFF', '#0056CC'],
        ['#4169E1', '#0000FF'],
        ['#0000FF', '#0000CD'],
        ['#6495ED', '#4682B4'],
        ['#87CEEB', '#87CEFA'],
        ['#B0C4DE', '#ADD8E6'],
        ['#ADD8E6', '#87CEEB'],
        ['#87CEFA', '#00BFFF'],
        ['#00BFFF', '#1E90FF'],
      ],
      education: [
        ['#FFCC02', '#FFB300'],
        ['#FFD700', '#FFA500'],
        ['#FFA500', '#FF8C00'],
        ['#FF8C00', '#FF7F00'],
        ['#FFAB00', '#FF9800'],
        ['#FFB74D', '#FF9800'],
        ['#FFCC80', '#FFB74D'],
        ['#FFE0B2', '#FFCC80'],
        ['#FFF3E0', '#FFE0B2'],
      ],
      'beauty-wellness': [
        ['#FF2D92', '#E91E63'],
        ['#FF69B4', '#C71585'],
        ['#FFB6C1', '#FF69B4'],
        ['#FFC0CB', '#FFB6C1'],
        ['#FFCCCB', '#FFC0CB'],
        ['#F0E68C', '#DAA520'],
        ['#DDA0DD', '#D8BFD8'],
        ['#EE82EE', '#DA70D6'],
        ['#DA70D6', '#BA55D3'],
      ],
      entertainment: [
        ['#FF3B30', '#E53935'],
        ['#FF6347', '#FF4500'],
        ['#FF4500', '#FF0000'],
        ['#FF0000', '#DC143C'],
        ['#DC143C', '#B22222'],
        ['#B22222', '#8B0000'],
        ['#CD5C5C', '#A0522D'],
        ['#F08080', '#FA8072'],
        ['#FA8072', '#E9967A'],
      ],
      'travel-vlogs': [
        ['#5AC8FA', '#29B6F6'],
        ['#87CEEB', '#87CEFA'],
        ['#00BFFF', '#1E90FF'],
        ['#1E90FF', '#0000FF'],
        ['#6495ED', '#4682B4'],
        ['#B0E0E6', '#ADD8E6'],
        ['#ADD8E6', '#87CEEB'],
        ['#87CEFA', '#00BFFF'],
        ['#00CED1', '#20B2AA'],
      ],
      'all-other': [
        ['#8E8E93', '#696969'],
        ['#A9A9A9', '#808080'],
        ['#C0C0C0', '#A9A9A9'],
        ['#D3D3D3', '#C0C0C0'],
        ['#DCDCDC', '#D3D3D3'],
        ['#F5F5F5', '#DCDCDC'],
        ['#GAINSBORO', '#D3D3D3'],
        ['#LIGHTGRAY', '#C0C0C0'],
        ['#SILVER', '#A9A9A9'],
      ],
    };

    const gradients =
      gradientSchemes[categoryId] || gradientSchemes['all-other'];
    return gradients[index % gradients.length];
  };

  const renderSubcategoryItem = (subcategory, index) => {
    const gradientColors = getSubcategoryGradient(index, categoryId);
    const iconName = getSubcategoryIcon(subcategory.id, categoryId);

    return (
      <View key={subcategory.id} style={styles.subcategoryItemContainer}>
        <TouchableOpacity
          style={[
            styles.subcategoryItem,
            {
              backgroundColor: gradientColors[0],
              shadowColor: gradientColors[0],
            },
          ]}
          onPress={() => handleSubcategoryPress(subcategory)}
          activeOpacity={0.85}>
          <View style={styles.subcategoryContent}>
            <View
              style={[
                styles.iconContainer,
                {backgroundColor: gradientColors[1]},
              ]}>
              <Icon name={iconName} size={24} color="#fff" />
            </View>
            <Text style={styles.subcategoryText} numberOfLines={2}>
              {subcategory.name}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const getCategoryBadgeColor = categoryId => {
    const badgeColors = {
      kids: '#FF6B35',
      'food-recipes': '#FF4500',
      music: '#9370DB',
      'news-knowledge': '#E74C3C',
      'gaming-sports': '#27AE60',
      'art-diy': '#E67E22',
      technology: '#3498DB',
      education: '#F1C40F',
      'beauty-wellness': '#E91E63',
      entertainment: '#9370DB',
      'travel-vlogs': '#00BCD4',
      'all-other': '#607D8B',
    };
    return badgeColors[categoryId] || '#607D8B';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F8F9FA" barStyle="dark-content" />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View
            style={[
              styles.categoryBadge,
              {backgroundColor: getCategoryBadgeColor(categoryId)},
            ]}>
            <Text style={styles.categoryBadgeText}>{categoryName}</Text>
          </View>
        </View>
        <View style={styles.placeholder} />
      </Animated.View>

      <Animated.View
        style={[
          styles.topPicksContainer,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Text style={styles.topPicksTitle}>Top Picks</Text>
        <Text style={styles.topPicksSubtitle}>
          Discover the best content in {categoryName}
        </Text>
      </Animated.View>

      <View style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.subcategoriesGrid}>
            {subcategories.map((subcategory, index) =>
              renderSubcategoryItem(subcategory, index),
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryBadgeText: {
    fontSize: 16,
    fontFamily: AppFonts.Bold,
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  topPicksContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  topPicksTitle: {
    fontSize: 24,
    fontFamily: AppFonts.Bold,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  topPicksSubtitle: {
    fontSize: 14,
    fontFamily: AppFonts.Regular,
    color: '#666',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subcategoryItemContainer: {
    marginBottom: 16,
  },
  subcategoryItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 18,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  subcategoryContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  subcategoryText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: AppFonts.Bold,
    textAlign: 'center',
    lineHeight: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});

export default CategoryScreen;
