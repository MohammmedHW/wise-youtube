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
import {useNavigation} from '@react-navigation/native';
import {getCategoriesArray} from '../constants';
import AppColors from '../utils/AppColors';
import AppFonts from '../utils/AppFonts';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('window');
const ITEM_WIDTH = (width - 60) / 3;

const categoryIcons = {
  kids: 'child-care',
  'food-recipes': 'restaurant',
  music: 'music-note',
  'news-knowledge': 'article',
  'gaming-sports': 'sports-esports',
  'art-diy': 'palette',
  technology: 'computer',
  education: 'school',
  'beauty-wellness': 'spa',
  entertainment: 'movie',
  'travel-vlogs': 'flight',
  'all-other': 'apps',
};

const categoryGradients = {
  kids: ['#FF6B35', '#F7931E', '#FFB347'],
  'food-recipes': ['#FF4500', '#FF6347', '#FF7F50'],
  music: ['#9370DB', '#8A2BE2', '#BA55D3'],
  'news-knowledge': ['#E74C3C', '#C0392B', '#EC7063'],
  'gaming-sports': ['#27AE60', '#2ECC71', '#58D68D'],
  'art-diy': ['#E67E22', '#F39C12', '#F8C471'],
  technology: ['#3498DB', '#2980B9', '#5DADE2'],
  education: ['#F1C40F', '#F39C12', '#F7DC6F'],
  'beauty-wellness': ['#E91E63', '#AD1457', '#F06292'],
  entertainment: ['#9370DB', '#8A2BE2', '#BA68C8'],
  'travel-vlogs': ['#00BCD4', '#0097A7', '#4DD0E1'],
  'all-other': ['#607D8B', '#546E7A', '#78909C'],
};

function HomeScreen() {
  const navigation = useNavigation();
  const categories = getCategoriesArray();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCategoryPress = category => {
    navigation.navigate('CategoryScreen', {
      categoryId: category.id,
      categoryName: category.name,
      subcategories: category.subcategories,
    });
  };

  const renderCategoryItem = (category, index) => {
    const gradientColors =
      categoryGradients[category.id] || categoryGradients['all-other'];
    const iconName = categoryIcons[category.id] || 'apps';

    const itemDelay = index * 100;
    const itemFadeAnim = useRef(new Animated.Value(0)).current;
    const itemScaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(itemDelay),
        Animated.parallel([
          Animated.timing(itemFadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(itemScaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, [itemDelay, itemFadeAnim, itemScaleAnim]);

    return (
      <Animated.View
        key={category.id}
        style={[
          styles.categoryItemContainer,
          {
            opacity: itemFadeAnim,
            transform: [{scale: itemScaleAnim}],
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.categoryItem,
            {
              backgroundColor: gradientColors[0],
              shadowColor: gradientColors[0],
            },
          ]}
          onPress={() => handleCategoryPress(category)}
          activeOpacity={0.85}>
          <View style={styles.categoryContent}>
            <View
              style={[
                styles.iconContainer,
                {backgroundColor: gradientColors[1]},
              ]}>
              <Icon name={iconName} size={32} color="#fff" />
            </View>
            <Text style={styles.categoryText} numberOfLines={2}>
              {category.name}
            </Text>
          </View>
          <View
            style={[
              styles.categoryOverlay,
              {backgroundColor: gradientColors[2]},
            ]}
          />
        </TouchableOpacity>
      </Animated.View>
    );
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
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome!</Text>
          <Text style={styles.headerTitle}>Select Category</Text>
          <Text style={styles.headerSubtitle}>
            Choose what you'd like to explore today
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.categoriesGrid,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {categories.map((category, index) =>
            renderCategoryItem(category, index),
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: AppFonts.Regular,
    color: '#666',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: AppFonts.Bold,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: AppFonts.Regular,
    color: '#888',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItemContainer: {
    marginBottom: 20,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH + 10,
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
  },
  categoryContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    zIndex: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: AppFonts.Bold,
    textAlign: 'center',
    lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    zIndex: 1,
  },
});

export default HomeScreen;
