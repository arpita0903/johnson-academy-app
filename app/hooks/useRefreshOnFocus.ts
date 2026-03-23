import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Refetches stale queries when the screen comes into focus.
 * Use this hook in screens where you want fresh data when navigating back.
 *
 * @example
 * ```tsx
 * const MyScreen = () => {
 *   useRefreshOnFocus();
 *   const { data } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos });
 *   return <Text>{data?.title}</Text>;
 * };
 * ```
 */
export function useRefreshOnFocus() {
  const queryClient = useQueryClient();
  const firstTimeRef = React.useRef(true);

  useFocusEffect(
    React.useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }
      queryClient.refetchQueries({ stale: true, type: "active" });
    }, [queryClient])
  );
}
