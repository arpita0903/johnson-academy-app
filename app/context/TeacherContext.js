import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";

const TeacherContext = createContext();

export const TeacherProvider = ({ children }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const selectClass = useCallback((classData) => {
    setSelectedClass(classData);
    setSelectedStudent(null);
  }, []);

  const selectStudent = useCallback((studentData) => {
    setSelectedStudent(studentData);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedClass(null);
    setSelectedStudent(null);
  }, []);

  const clearStudentSelection = useCallback(() => {
    setSelectedStudent(null);
  }, []);

  const clearClassSelection = useCallback(() => {
    setSelectedClass(null);
    setSelectedStudent(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedClass,
      selectedStudent,
      selectClass,
      selectStudent,
      clearSelection,
      clearStudentSelection,
      clearClassSelection,
    }),
    [
      selectedClass,
      selectedStudent,
      selectClass,
      selectStudent,
      clearSelection,
      clearStudentSelection,
      clearClassSelection,
    ]
  );

  return (
    <TeacherContext.Provider value={value}>{children}</TeacherContext.Provider>
  );
};

export const useTeacherContext = () => useContext(TeacherContext);
