import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";

export interface ScreenHeroCardProps {
  title: string;
  subtitle: string;
  subtitleIcon?: string;
  imageUri?: string | null;
  fallbackIcon?: string;
  accentLine?: string;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeroCard({
  title,
  subtitle,
  subtitleIcon = "badge",
  imageUri,
  fallbackIcon = "person",
  accentLine,
  style,
}: ScreenHeroCardProps) {
  const { isDark } = useTheme();
  const s = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={[s.heroOuter, style]}>
      <LinearGradient
        colors={
          !isDark
            ? ["rgba(94, 234, 212, 0.14)", "rgba(167, 139, 250, 0.16)"]
            : ["rgba(45, 212, 191, 0.14)", "rgba(167, 139, 250, 0.12)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.heroGradientFill}
      >
        <View style={s.heroInner}>
          <View style={s.heroTopRow}>
            <View style={s.heroAvatarWell}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={s.heroAvatar}
                  accessibilityLabel={`Photo of ${title}`}
                />
              ) : (
                <View style={s.heroIconWell}>
                  <Icon
                    name={fallbackIcon}
                    size={28}
                    color={
                      isDark
                        ? "rgba(167, 139, 250, 0.95)"
                        : "rgba(109, 40, 217, 0.85)"
                    }
                  />
                </View>
              )}
            </View>
            <View style={s.heroTextBlock}>
              <Text style={s.heroTitle} numberOfLines={2}>
                {title}
              </Text>
              <View style={s.heroSubRow}>
                <Icon
                  name={subtitleIcon}
                  size={16}
                  color={
                    isDark
                      ? "rgba(148, 163, 184, 0.95)"
                      : "rgba(71, 85, 105, 0.9)"
                  }
                  style={s.heroSubIcon}
                />
                <Text style={s.heroSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
              {accentLine ? (
                <Text style={s.heroCourseLine} numberOfLines={2}>
                  {accentLine}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    heroOuter: {
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 18,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.18)"
        : "rgba(167, 139, 250, 0.22)",
      backgroundColor: isDark
        ? "rgba(13, 17, 34, 0.85)"
        : "rgba(255, 255, 255, 0.88)",
    },
    heroGradientFill: {
      borderRadius: 19,
    },
    heroInner: {
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    heroAvatarWell: {
      marginRight: 14,
    },
    heroAvatar: {
      width: 56,
      height: 56,
      borderRadius: 16,
    },
    heroIconWell: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: isDark
        ? "rgba(167, 139, 250, 0.4)"
        : "rgba(45, 212, 191, 0.4)",
      backgroundColor: isDark
        ? "rgba(167, 139, 250, 0.08)"
        : "rgba(45, 212, 191, 0.08)",
    },
    heroTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.35,
      color: isDark ? "#F8FAFC" : "#0f172a",
    },
    heroSubRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
    },
    heroSubIcon: {
      marginRight: 6,
    },
    heroSubtitle: {
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
      color: isDark ? "#CBD5E1" : "#64748B",
    },
    heroCourseLine: {
      marginTop: 8,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: -0.15,
      color: isDark ? "rgba(167, 139, 250, 0.95)" : "rgba(109, 40, 217, 0.82)",
    },
  });
}
