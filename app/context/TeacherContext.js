import React, { createContext, useState, useContext } from "react";

const TeacherContext = createContext();

export const TeacherProvider = ({ children }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const selectClass = (classData) => {
    setSelectedClass(classData);
    // Clear selected student when a new class is selected
    setSelectedStudent(null);
  };

  const selectStudent = (studentData) => {
    setSelectedStudent(studentData);
  };

  const clearSelection = () => {
    setSelectedClass(null);
    setSelectedStudent(null);
  };

  const clearStudentSelection = () => {
    setSelectedStudent(null);
  };

  const clearClassSelection = () => {
    setSelectedClass(null);
    setSelectedStudent(null);
  };

  return (
    <TeacherContext.Provider
      value={{
        selectedClass,
        selectedStudent,
        selectClass,
        selectStudent,
        clearSelection,
        clearStudentSelection,
        clearClassSelection,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacherContext = () => useContext(TeacherContext);
