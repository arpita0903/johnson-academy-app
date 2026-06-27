import { useState } from "react";
import { useNavigation, type NavigationProp } from "@react-navigation/native";
import { useToast } from "../../context/ToastContext";
import { usePromoteStudent } from "./usePromoteStudent";

export interface UsePromoteStudentFlowParams {
  studentId: string | null | undefined;
  classId: string | null | undefined;
  studentName: string;
  courseId: string | null | undefined;
  courseName: string;
}

type PromoteStudentNavigation = NavigationProp<{
  TeacherDashboard: undefined;
}>;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "Failed to promote student.";
}

export function usePromoteStudentFlow({
  studentId,
  classId,
  studentName,
  courseId,
  courseName,
}: UsePromoteStudentFlowParams) {
  const navigation = useNavigation<PromoteStudentNavigation>();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { showSuccess, showError, showInfo } = useToast();
  const { mutate, isPending: isPromoting } = usePromoteStudent();

  const isDisabled = !studentId || !classId || !courseId;

  const openConfirm = () => {
    if (isDisabled) return;
    setConfirmOpen(true);
  };

  const cancelConfirm = () => {
    setConfirmOpen(false);
  };

  const confirmPromote = () => {
    if (!studentId || !classId || !courseId || isPromoting) return;

    mutate(
      {
        classId,
        studentId,
        courseId,
      },
      {
        onSuccess: (response) => {
          if (response.alreadyPromoted) {
            showInfo(`${studentName} is already enrolled in ${courseName}.`);
          } else {
            showSuccess(
              `${studentName} promoted to ${courseName} successfully.`,
            );
          }
          navigation.navigate("TeacherDashboard");
        },
        onError: (error: unknown) => {
          showError(getErrorMessage(error));
        },
        onSettled: () => {
          setConfirmOpen(false);
        },
      },
    );
  };

  return {
    isDisabled,
    isPromoting,
    confirmOpen,
    courseName,
    studentName,
    openConfirm,
    cancelConfirm,
    confirmPromote,
  };
}

export type PromoteStudentFlow = ReturnType<typeof usePromoteStudentFlow>;
