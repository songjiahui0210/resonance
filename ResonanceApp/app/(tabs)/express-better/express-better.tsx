// express-better.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { 
  CommunicationContext,
  ExpressionRefinementInput,
  ExpressionAnalysis,
  AnalysisSection,
  AnalysisState,
  ToneFeedback,
  ClarityFeedback
} from '@/app/(tabs)/express-better/utils/types';
import { refineExpression, useExpressionRefinement } from '@/app/(tabs)/express-better/utils/context';
import { 
  TextInput, 
  Button, 
  Card, 
  Chip, 
  ActivityIndicator,
  useTheme,
  IconButton,
  Surface,
  ProgressBar,
  Modal,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function ExpressBetterScreen() {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Expression Refinement States
  const [expressionInput, setExpressionInput] = useState<ExpressionRefinementInput>({
    content: '',
    context: 'conversation',
    audience: '',
    goal: ''
  });
  const [expressionAnalysis, setExpressionAnalysis] = useState<ExpressionAnalysis | null>(null);

  // Analysis State
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    sections: {
      message: { isVisible: true, isRead: false },
      improvement: { isVisible: false, isRead: false },
      emotions: { isVisible: false, isRead: false },
      suggestion: { isVisible: false, isRead: false },
      tips: { isVisible: false, isRead: false },
    },
    currentSection: 'message',
  });

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(20);

  const snapPoints = useMemo(() => ['60%', '90%'], []);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAllCards, setShowAllCards] = useState(false);

  // Initialize bottom sheet
  useEffect(() => {
    return () => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.close();
      }
    };
  }, []);

  const showBottomSheet = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.present();
      setIsBottomSheetVisible(true);
    }
  }, []);

  const hideBottomSheet = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.dismiss();
      setIsBottomSheetVisible(false);
    }
  }, []);

  const showModal = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.present();
      setIsBottomSheetVisible(true);
    }
  }, []);

  const hideModal = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.dismiss();
      setIsBottomSheetVisible(false);
    }
  }, []);

  // Expression Refinement Handler
  const handleExpressionSubmit = async () => {
    if (!expressionInput.content.trim()) return;
    
    setIsLoading(true);
    try {
      const analysis = await refineExpression(expressionInput);
      setExpressionAnalysis(analysis);
      hideModal();
      setCurrentCardIndex(0);
      setShowAllCards(false);
    } catch (error) {
      console.error('Error refining expression:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderInputForm = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>What do you want to express?</Text>
      <TextInput
        mode="outlined"
        multiline
        numberOfLines={4}
        placeholder="Type your message here..."
        value={expressionInput.content}
        onChangeText={(text: string) => setExpressionInput({...expressionInput, content: text})}
        style={styles.input}
        theme={{ colors: { primary: theme.colors.primary } }}
      />

      <Text style={styles.label}>Context</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.contextScroll}
        contentContainerStyle={styles.contextScrollContent}
      >
        {(['email', 'conversation', 'meeting', 'presentation', 'feedback', 'request'] as CommunicationContext[]).map((ctx) => (
          <Chip
            key={ctx}
            selected={expressionInput.context === ctx}
            onPress={() => setExpressionInput({...expressionInput, context: ctx})}
            style={[
              styles.contextChip,
              expressionInput.context === ctx && styles.selectedChip
            ]}
            mode="outlined"
            showSelectedCheck={false}
          >
            {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
          </Chip>
        ))}
      </ScrollView>

      <Text style={styles.label}>Who are you communicating with?</Text>
      <TextInput
        mode="outlined"
        placeholder="e.g., boss, colleague, friend..."
        value={expressionInput.audience}
        onChangeText={(text: string) => setExpressionInput({...expressionInput, audience: text})}
        style={styles.input}
        theme={{ colors: { primary: theme.colors.primary } }}
      />

      <Text style={styles.label}>What's your goal?</Text>
      <TextInput
        mode="outlined"
        placeholder="e.g., get approval, explain a problem..."
        value={expressionInput.goal}
        onChangeText={(text: string) => setExpressionInput({...expressionInput, goal: text})}
        style={styles.input}
        theme={{ colors: { primary: theme.colors.primary } }}
      />

      <Button
        mode="contained"
        onPress={handleExpressionSubmit}
        disabled={!expressionInput.content.trim() || isLoading}
        loading={isLoading}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
      >
        Help me refine this
      </Button>
    </View>
  );

  const renderAnalysisCard = (title: string, content: React.ReactNode, icon: string) => (
    <Animated.View 
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.cardContainer, { marginHorizontal: 8 }]}
    >
      <Card style={styles.card}>
        <Card.Title
          title={title}
          titleStyle={{ fontSize: 16 }}
          left={(props: any) => <IconButton {...props} icon={icon} size={20} />}
        />
        <ScrollView 
          style={styles.cardScrollView}
          contentContainerStyle={styles.cardScrollViewContent}
          showsVerticalScrollIndicator={true}
        >
          {content}
        </ScrollView>
      </Card>
    </Animated.View>
  );

  const renderAnalysis = () => {
    if (!expressionAnalysis) return null;

    const cards = [
      {
        title: "Understanding Your Message",
        icon: "chatbubble-outline",
        content: (
          <>
            <Text style={styles.sectionTitle}>What You Want to Say</Text>
            <Text style={styles.sectionContent}>{expressionAnalysis.messageBreakdown.mainIdea}</Text>
            
            <Text style={styles.sectionTitle}>Key Points to Include</Text>
            {expressionAnalysis.messageBreakdown.supportingPoints.map((point: string, index: number) => (
              <Text key={index} style={styles.sectionContent}>• {point}</Text>
            ))}
            
            <Text style={styles.sectionTitle}>What You Want to Happen</Text>
            <Text style={styles.sectionContent}>{expressionAnalysis.messageBreakdown.actionNeeded}</Text>
          </>
        )
      },
      {
        title: "Helping Your Message Land Well",
        icon: "bulb-outline",
        content: (
          <>
            {expressionAnalysis.communicationFeedback.toneFeedback.map((feedback: ToneFeedback, index: number) => (
              <View key={index} style={styles.feedbackSection}>
                <Text style={styles.sectionTitle}>How Your Tone Comes Across</Text>
                <Text style={styles.sectionContent}>What we noticed: {feedback.whatWeNoticed}</Text>
                <Text style={styles.sectionContent}>How it might affect others: {feedback.howItMightAffect}</Text>
                <Text style={styles.sectionContent}>A gentler way to say it: {feedback.gentlerWay}</Text>
              </View>
            ))}

            {expressionAnalysis.communicationFeedback.clarityFeedback.map((feedback: ClarityFeedback, index: number) => (
              <View key={index} style={styles.feedbackSection}>
                <Text style={styles.sectionTitle}>Making Your Message Clearer</Text>
                <Text style={styles.sectionContent}>What might be unclear: {feedback.unclearPart}</Text>
                <Text style={styles.sectionContent}>Why this matters: {feedback.whyItMatters}</Text>
                <Text style={styles.sectionContent}>How to make it clearer: {feedback.clearerWay}</Text>
              </View>
            ))}
          </>
        )
      },
      {
        title: "Helping Your Feelings Land Well",
        icon: "heart-outline",
        content: (
          <>
            <Text style={styles.sectionTitle}>Understanding Your Feelings</Text>
            <Text style={styles.sectionContent}>{expressionAnalysis.emotionalGuidance.emotionalAwareness.yourFeeling}</Text>
            <Text style={styles.sectionContent}>Why you might feel this way: {expressionAnalysis.emotionalGuidance.emotionalAwareness.understandingWhy}</Text>
            <Text style={styles.sectionContent}>How others might receive this: {expressionAnalysis.emotionalGuidance.emotionalAwareness.impactOnOthers}</Text>
            
            <Text style={styles.sectionTitle}>Expressing Your Feelings Effectively</Text>
            <Text style={styles.sectionContent}>What makes this challenging: {expressionAnalysis.emotionalGuidance.balancedExpression.challenge}</Text>
            <Text style={styles.sectionContent}>Your feelings are valid: {expressionAnalysis.emotionalGuidance.balancedExpression.validation}</Text>
            <Text style={styles.sectionContent}>A way to express this: {expressionAnalysis.emotionalGuidance.balancedExpression.betterApproach}</Text>
          </>
        )
      },
      {
        title: "A Way to Say It",
        icon: "checkmark-circle-outline",
        content: (
          <>
            <Text style={styles.sectionTitle}>Here's a way to express this</Text>
            <Text style={styles.sectionContent}>{expressionAnalysis.improvedVersion.suggestion}</Text>
            <Text style={styles.sectionTitle}>Why this might work better</Text>
            <Text style={styles.sectionContent}>{expressionAnalysis.improvedVersion.explanation}</Text>
          </>
        )
      }
    ];

    return (
      <View style={styles.analysisContainer}>
        {!showAllCards ? (
          <>
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={(currentCardIndex + 1) / cards.length}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                Card {currentCardIndex + 1} of {cards.length}
              </Text>
            </View>

            {renderAnalysisCard(
              cards[currentCardIndex].title,
              cards[currentCardIndex].content,
              cards[currentCardIndex].icon
            )}

            <View style={styles.navigationButtons}>
              <Button
                mode="outlined"
                onPress={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
                disabled={currentCardIndex === 0}
                style={styles.navButton}
              >
                <Text>Previous</Text>
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  if (currentCardIndex === cards.length - 1) {
                    setShowAllCards(true);
                  } else {
                    setCurrentCardIndex(prev => Math.min(cards.length - 1, prev + 1));
                  }
                }}
                style={styles.navButton}
              >
                <Text>{currentCardIndex === cards.length - 1 ? 'View All' : 'Next'}</Text>
              </Button>
            </View>
          </>
        ) : (
          <>
            <View style={styles.viewAllHeader}>
              <Button
                mode="outlined"
                onPress={() => setShowAllCards(false)}
                icon="arrow-left"
                style={styles.backButton}
              >
                <Text>Back to Cards</Text>
              </Button>
            </View>
            <ScrollView style={styles.scrollView}>
              {cards.map((card, index) => (
                <View key={index} style={styles.cardContainer}>
                  {renderAnalysisCard(card.title, card.content, card.icon)}
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <ScrollView style={styles.emptyStateContainer}>
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.primary} />
        <Text style={styles.emptyStateTitle}>Welcome to Express Better</Text>
        <Text style={styles.emptyStateSubtitle}>
          Your personal communication guide for expressing yourself clearly and effectively
        </Text>
        
        <View style={styles.featuresContainer}>
          <FeatureItem 
            icon="bulb-outline"
            title="Clear Communication"
            description="Get help expressing your thoughts in a way that others understand"
          />
          <FeatureItem 
            icon="heart-outline"
            title="Emotional Support"
            description="Learn how to express feelings while maintaining healthy relationships"
          />
          <FeatureItem 
            icon="checkmark-circle-outline"
            title="Practical Tips"
            description="Receive specific suggestions for different communication scenarios"
          />
        </View>

        <View style={styles.quickStartContainer}>
          <Text style={styles.quickStartTitle}>Quick Start</Text>
          <Text style={styles.quickStartText}>
            Tap "New Message" to get started. You can:
          </Text>
          <Text style={styles.quickStartItem}>• Write what you want to express</Text>
          <Text style={styles.quickStartItem}>• Choose the context (email, conversation, etc.)</Text>
          <Text style={styles.quickStartItem}>• Get personalized guidance</Text>
        </View>

        <Button
          mode="contained"
          onPress={showModal}
          icon="plus"
          style={styles.startButton}
        >
          <Text>Start Expressing Better</Text>
        </Button>
      </View>
    </ScrollView>
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
        opacity={0.5}
      />
    ),
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    setBottomSheetIndex(index);
  }, []);

  const FeatureItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={styles.featureItem}>
      <Ionicons name={icon as any} size={24} color={theme.colors.primary} />
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <View style={styles.container}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
          >
            <Surface style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <Text style={styles.headerTitle}>Express</Text>
                  <Text style={styles.headerSubtitle}>Better</Text>
                </View>
                <Button
                  mode="contained"
                  onPress={showModal}
                  icon="plus"
                  style={styles.addButton}
                >
                  New Message
                </Button>
              </View>
            </Surface>

            {expressionAnalysis ? (
              renderAnalysis()
            ) : (
              renderEmptyState()
            )}

            <BottomSheetModal
              ref={bottomSheetRef}
              index={0}
              snapPoints={snapPoints}
              onChange={handleSheetChanges}
              backdropComponent={renderBackdrop}
              handleIndicatorStyle={styles.handleIndicator}
            >
              <BottomSheetView style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>New Message</Text>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={hideModal}
                  />
                </View>
                <ScrollView 
                  style={styles.scrollView}
                  contentContainerStyle={styles.scrollViewContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {renderInputForm()}
                </ScrollView>
              </BottomSheetView>
            </BottomSheetModal>
          </KeyboardAvoidingView>
        </View>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    elevation: 4,
    backgroundColor: '#fff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196f3',
    marginRight: 4,
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  addButton: {
    borderRadius: 20,
  },
  emptyStateContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  featureText: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  quickStartContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 32,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickStartText: {
    fontSize: 16,
    marginBottom: 8,
  },
  quickStartItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
  startButton: {
    marginTop: 16,
    borderRadius: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 0,
    borderRadius: 12,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 32,
  },
  inputContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  contextScroll: {
    marginBottom: 16,
  },
  contextScrollContent: {
    paddingRight: 16,
  },
  contextChip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedChip: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 20,
    elevation: 2,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  analysisContainer: {
    flex: 1,
    padding: 16,
    width: '100%',
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  cardContainer: {
    marginBottom: 16,
    marginTop: 8,
    width: '100%',
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    height: 400,
  },
  handleIndicator: {
    backgroundColor: '#DEDEDE',
    width: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 10,
  },
  feedbackSection: {
    marginBottom: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  viewAllHeader: {
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  cardScrollView: {
    maxHeight: 300,
  },
  cardScrollViewContent: {
    padding: 16,
  },
});