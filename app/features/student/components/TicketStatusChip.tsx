import React from "react";
import { Text, StyleSheet } from "react-native";
import { TicketStatus } from "../../../types/ticket";
import {
  ticketStatusColors,
  ticketStatusLabel,
} from "../utils/ticketDisplay";

interface TicketStatusChipProps {
  status: TicketStatus;
}

export function TicketStatusChip({ status }: TicketStatusChipProps) {
  const colors = ticketStatusColors(status);
  return (
    <Text
      style={[
        styles.chip,
        { backgroundColor: colors.background, color: colors.text },
      ]}
    >
      {ticketStatusLabel(status)}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    overflow: "hidden",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
  },
});
