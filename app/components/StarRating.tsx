import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemeColors } from "../theme/colors";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  colors: ThemeColors;
  readonly?: boolean;
}

const StarRating = ({
  rating,
  onRatingChange,
  size = 24,
  colors,
  readonly = false,
}: StarRatingProps) => {
  const renderStar = (index: number) => {
    const isFilled = index <= rating;
    const StarComponent = readonly ? View : TouchableOpacity;

    return (
      <StarComponent
        key={index}
        onPress={readonly ? undefined : () => onRatingChange?.(index)}
        style={{ padding: readonly ? 2 : 4 }}
      >
        <MaterialIcons
          name={isFilled ? "star" : "star-border"}
          size={size}
          color={isFilled ? "#FFD700" : colors.textSecondary}
        />
      </StarComponent>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {[1, 2, 3, 4, 5].map(renderStar)}
    </View>
  );
};

export default StarRating;
