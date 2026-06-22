import React, { useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { loginButtonGradientColors } from "../../theme/colors";
import { GlassCard } from "./GlassCard";
import { ConfirmActionModal } from "./ConfirmActionModal";
import type { PromoteStudentFlow } from "../hooks/usePromoteStudentFlow";

export interface PromoteStudentCardProps {
  flow: PromoteStudentFlow;
}

export function PromoteStudentCard({ flow }: PromoteStudentCardProps) {
  const s = useMemo(() => createCardStyles(), []);

  return (
    <GlassCard
      title="Promote student"
      subtitle={
        flow.courseName
          ? `Promote from "${flow.courseName}" to the next level in this class.`
          : "Move this student to a higher-level course in the same class."
      }
      spacing="default"
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={flow.openConfirm}
        disabled={flow.isDisabled}
        style={[s.ctaShell, flow.isDisabled && s.ctaDisabled]}
      >
        <LinearGradient
          colors={[...loginButtonGradientColors]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={s.ctaGradient}
        >
          <Icon name="trending-up" size={20} color="#FFFFFF" />
          <Text style={s.ctaText}>Promote student</Text>
        </LinearGradient>
      </TouchableOpacity>
    </GlassCard>
  );
}

export interface PromoteStudentOverlaysProps {
  flow: PromoteStudentFlow;
}

export function PromoteStudentOverlays({ flow }: PromoteStudentOverlaysProps) {
  const confirmMessage = flow.courseName
    ? `Promote ${flow.studentName} from "${flow.courseName}"? This will update their course progress.`
    : "";

  return (
    <ConfirmActionModal
      visible={flow.confirmOpen}
      title="Confirm promotion"
      message={confirmMessage}
      confirmLabel="Promote"
      isLoading={flow.isPromoting}
      onConfirm={flow.confirmPromote}
      onCancel={flow.cancelConfirm}
    />
  );
}

function createCardStyles() {
  return StyleSheet.create({
    ctaShell: {
      marginTop: 10,
      borderRadius: 14,
      overflow: "hidden",
    },
    ctaDisabled: {
      opacity: 0.45,
    },
    ctaGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    ctaText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
    },
  });
}
