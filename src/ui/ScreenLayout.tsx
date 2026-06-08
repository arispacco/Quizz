import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenLayout({
  children,
  title,
  showBack = false,
  scroll = false,
  style,
  contentStyle,
}: ScreenLayoutProps) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const header = (title || showBack) && (
    <View style={styles.header}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={8}>
          <ArrowLeft color={theme.colors.text} size={22} />
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.text, marginLeft: 4 }]}>
            Retour
          </Text>
        </Pressable>
      ) : (
        <View />
      )}
      {title ? (
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>{title}</Text>
      ) : null}
    </View>
  );

  const body = (
    <>
      {header}
      {children}
    </>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }, style]}
      edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content, contentStyle]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 16 },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
});
