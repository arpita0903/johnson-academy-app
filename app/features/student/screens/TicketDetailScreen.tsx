import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../config/queryKeys";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";
import { getTicket, getTicketErrorMessage } from "../../../services/tickets";
import { TicketStatusChip } from "../components/TicketStatusChip";
import {
  formatResolutionDays,
  formatTicketDate,
} from "../utils/ticketDisplay";

interface TicketDetailScreenProps {
  navigation: {
    setOptions: (options: { headerTitle?: string }) => void;
    goBack: () => void;
  };
  route: {
    params?: {
      ticketId?: string;
    };
  };
}

const MetaRow = ({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

const TicketDetailScreen = ({ navigation, route }: TicketDetailScreenProps) => {
  const ticketId = route.params?.ticketId ?? "";
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  useRefreshOnFocus();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.ticket(ticketId),
    queryFn: () => getTicket(ticketId),
    enabled: ticketId.length > 0,
  });

  useEffect(() => {
    if (data?.displayId) {
      navigation.setOptions({ headerTitle: data.displayId });
    }
  }, [data?.displayId, navigation]);

  const comments = (data?.activities ?? []).filter(
    (activity) => activity.type === "comment",
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenGradientBackground isDark={isDark} />
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      ) : isError || !data ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t open this concern</Text>
          <Text style={styles.emptyBody}>
            {getTicketErrorMessage(error, "This concern is unavailable.")}
          </Text>
          <TouchableOpacity style={styles.retry} onPress={() => refetch()}>
            <Text style={styles.retryLabel}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.ticketId}>{data.displayId}</Text>
              <TicketStatusChip status={data.status} />
            </View>
            <Text style={styles.subject}>{data.subject}</Text>
            <Text style={styles.description}>{data.description}</Text>
          </View>

          <View style={styles.card}>
            <MetaRow
              styles={styles}
              label="Raised"
              value={formatTicketDate(data.createdAt)}
            />
            <MetaRow
              styles={styles}
              label="Assigned to"
              value={data.assignee?.name ?? "Not assigned yet"}
            />
            <MetaRow
              styles={styles}
              label="Resolved"
              value={formatTicketDate(data.resolvedAt)}
            />
            <MetaRow
              styles={styles}
              label="Days to resolve"
              value={formatResolutionDays(data.resolutionDays)}
            />
          </View>

          <Text style={styles.sectionTitle}>Notes from the academy</Text>
          {comments.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyBody}>
                No notes yet. You’ll see updates here when the team replies.
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={`${comment.at}-${comment.body}`} style={styles.card}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>
                    {comment.actor?.name ?? "Academy"}
                  </Text>
                  <Text style={styles.commentDate}>
                    {formatTicketDate(comment.at)}
                  </Text>
                </View>
                <Text style={styles.description}>{comment.body}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: "transparent",
    },
    loader: {
      marginTop: 48,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 32,
      gap: 12,
    },
    card: {
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.88)" : colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(148, 163, 184, 0.24)" : colors.cardBorder,
      padding: 16,
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    ticketId: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "800",
    },
    subject: {
      marginTop: 12,
      color: isDark ? "#F8FAFC" : colors.text,
      fontSize: 20,
      fontWeight: "800",
    },
    description: {
      marginTop: 10,
      color: isDark ? "#E2E8F0" : colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 8,
    },
    metaLabel: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    metaValue: {
      flex: 1,
      textAlign: "right",
      color: isDark ? "#F8FAFC" : colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    sectionTitle: {
      marginTop: 4,
      marginBottom: 4,
      color: isDark ? "#F8FAFC" : colors.text,
      fontSize: 16,
      fontWeight: "800",
    },
    commentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    commentAuthor: {
      color: isDark ? "#F8FAFC" : colors.text,
      fontSize: 14,
      fontWeight: "800",
    },
    commentDate: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    empty: {
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 48,
    },
    emptyTitle: {
      color: isDark ? "#F8FAFC" : colors.text,
      fontSize: 18,
      fontWeight: "800",
      textAlign: "center",
    },
    emptyBody: {
      marginTop: 8,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
    },
    retry: {
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    retryLabel: {
      color: colors.primaryText,
      fontWeight: "700",
    },
  });

export default TicketDetailScreen;
