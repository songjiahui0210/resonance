import { View, Text } from 'react-native';
import { useExpressionRefinement } from '@/app/(tabs)/express-better/utils/context';

export default function ExpressBetterScreen() {
  const { isLoading, error } = useExpressionRefinement();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Express Better</Text>
      {isLoading && <Text>Loading...</Text>}
      {error && <Text>Error: {error}</Text>}
    </View>
  );
}
