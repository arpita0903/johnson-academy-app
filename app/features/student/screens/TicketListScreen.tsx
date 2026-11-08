import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInfiniteQuery } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/MaterialIcons";
import { queryKeys } from "../../../config/queryKeys";
import { useTheme } from "../../../context/ThemeContext";
import { ThemeColors } from "../../../theme/colors";
import { ScreenGradientBackground } from "../../../shared/components/ScreenGradientBackground";
import { useRefreshOnFocus } from "../../../shared/hooks/useRefreshOnFocus";
import { listTickets, getTicketErrorMessage } from "../../../services/tickets";
import { TicketListItem } from "../../../types/ticket";
import { TicketStatusChip } from "../components/TicketStatusChip";
import { formatTicketDate } from "../utils/ticketDisplay";

interface TicketListScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
}

const TicketListScreen = ({ navigation }: TicketListScreenProps) => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  useRefreshOnFocus();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.tickets(),
    queryFn: ({ pageParam }) => listTickets(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });

  const tickets = data?.pages.flatMap((page) => page.results) ?? [];

  const openTicket = useCallback(
    (ticketId: string) => {
      navigation.navigate("TicketDetail", { ticketId });
    },
    [navigation],
  );

  const renderItem = ({ item }: { item: TicketListItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`${item.displayId}, ${item.subject}`}
      onPress={() => openTicket(item.id)}
    >
      <View style={styles.cardTop}>
        <Text style={styles.ticketId}>{item.displayId}</Text>
        <TicketStatusChip status={item.status} />
      </View>
      <Text style={styles.subject} numberOfLines={2}>
        {item.subject}
      </Text>
      <Text style={styles.meta}>Raised {formatTicketDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScreenGradientBackground isDark={isDark} />
      <View style={styles.body}>
        <TouchableOpacity
          style={styles.createButton}
          accessibilityRole="button"
          onPress={() => navigation.navigate("CreateTicket")}
        >
          <Icon name="add" size={20} color={colors.primaryText} />
          <Text style={styles.createLabel}>Raise a concern</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : isError ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Couldn’t load your concerns</Text>
            <Text style={styles.emptyBody}>
              {getTicketErrorMessage(error, "Please try again.")}
            </Text>
            <TouchableOpacity style={styles.retry} onPress={() => refetch()}>
              <Text style={styles.retryLabel}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={
              tickets.length === 0 ? styles.emptyList : styles.list
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefetching && !isFetchingNextPage}
                onRefresh={() => refetch()}
                tintColor={colors.primary}
              />
            }
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No concerns yet</Text>
                <Text style={styles.emptyBody}>
                  Raise a concern and you can follow its status here until it
                  is resolved.
                </Text>
              </View>
            }
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator
                  style={styles.footerLoader}
                  color={colors.primary}
                />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: "transparent",
    },
    body: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      marginBottom: 16,
    },
    createLabel: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "700",
    },
    loader: {
      marginTop: 48,
    },
    list: {
      paddingBottom: 24,
      gap: 12,
    },
    emptyList: {
      flexGrow: 1,
    },
    card: {
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.88)" : colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(148, 163, 184, 0.24)" : colors.cardBorder,
      padding: 16,
      marginBottom: 12,
    },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    ticketId: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.3,
    },
    subject: {
      marginTop: 10,
      color: isDark ? "#F8FAFC" : colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
    meta: {
      marginTop: 8,
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    empty: {
      alignItems: "center",
      paddingHorizontal: 12,
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
    footerLoader: {
      marginVertical: 16,
    },
  });

export default TicketListScreen;
