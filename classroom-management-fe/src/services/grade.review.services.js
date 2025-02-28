import http from "./http-config";

const API_URL = "https://classroom-management-be.vercel.app/";
// const API_URL = "http://localhost:3000/";

const createGradeReview = async ({
                                   classCode,
                                   gradeCompositionId,
                                   studentId,
                                   currentGrade,
                                   expectationGrade,
                                   explanation,
                                 } ) => {
  return await http.post(API_URL + "gradeReviews", {
    classCode,
    gradeCompositionId,
    studentId,
    currentGrade,
    expectationGrade,
    explanation,
  });
};

const getGradeReviewsByClassCode = async ({
                                                        classCode,
                                                      } ) => {
  return await http.get(API_URL + "gradeReviews/get-by-classcode/" + classCode );
};

const getGradeReviewsByClassCodeAndStudentId = async ({
                                   classCode,
                                   studentId
                                 } ) => {
  return await http.get(API_URL + "gradeReviews/" + classCode + "/" + studentId);
};

const getGradeReviewsByClassCodeAndStudentIds = async ({
                                                        classCode,
                                                        studentIds
                                                      } ) => {
  return await http.post(API_URL + "gradeReviews/get-by-classcode-and-studentids", {
    classCode, studentIds
  });
};

const addCommentByClassCodeStudentIdAndGradeCompositionId = async ({
                                                                     classCode, studentId, gradeCompositionId, commenter, comment
                                 } ) => {
  return await http.post(API_URL + "gradeReviews/add-comments", {
    classCode, studentId, gradeCompositionId, commenter, comment
  });
};

const updateFinalDecision = async ({classCode, gradeCompositionId, studentId, studentName, grade, markedBy        } ) => {
  return await http.put(API_URL + "gradeReviews/update-final-decision", {
    classCode, gradeCompositionId, studentId, studentName, grade, markedBy
  });
};


const GradeService = {
  createGradeReview,
  getGradeReviewsByClassCode,
  getGradeReviewsByClassCodeAndStudentId,
  getGradeReviewsByClassCodeAndStudentIds,
  addCommentByClassCodeStudentIdAndGradeCompositionId,
  updateFinalDecision
}

export default GradeService;