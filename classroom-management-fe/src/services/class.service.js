import http from "./http-config";

const API_URL = "https://classroom-management-be.vercel.app/";
// const API_URL = "http://localhost:3000/";

const createClass = async ({ className, section, subject, room, teacherId }) => {
  return await http.post(API_URL + "classes", {
    className, section, subject, room, teacherId
  });
};

const listClassesByTeacherId = async ({ teacherId }) => {
  return await http.get(API_URL + "classes/list-classes-by-teacher/" + teacherId);
};

const listClassesByStudentId = async ({ studentId }) => {
  return await http.get(API_URL + "classes/list-classes-by-student/" + studentId);
};

const getClassByClassCode = async ({ classCode }) => {
  return await http.get(API_URL + "classes/" + classCode);
};

const getClassByInvitationCode = async ({ invitationCode }) => {
  return await http.get(API_URL + "classes/invite/" + invitationCode);
};

const joinClassByLink = async ({ classCode, invitationCode, userId }) => {
  return await http.post(API_URL + "classes/join-class", {
    classCode, invitationCode, userId
  });
};

const joinClassByCode = async ({ invitationCode, userId }) => {
  return await http.post(API_URL + "classes/join-class-by-code", {
    invitationCode, userId
  });
};

const listPeopleByClassCode = async ({ classCode }) => {
  return await http.get(API_URL + "classes/get-people/" + classCode);
};

const inviteByEmail = async ({ name, email, classCode, teacherName, isTeacher }) => {
  return await http.post(API_URL + "classes/invite-by-email", {
    email, classCode, isTeacher
  });
};

const updateGradeCompositionByClassCode = async ({ gradeCompositions, classCode }) => {
  return await http.put(API_URL + "classes/" + classCode + "/gradeCompositions", {
    gradeCompositions
  });
};
const getGradeCompositionByClassCode = async ({ classCode }) => {
  return await http.get(API_URL + "classes/" + classCode + "/gradeCompositions");
};

const updateFinalizeInGradeComposition = async ({ gradeCompositionId, classCode }) => {
  return await http.put(API_URL + "classes/updateFinalized/" + classCode , {
    gradeCompositionId
  });
};

const getAllClasses = async () => {
  return await http.get(API_URL + "classes/get-all");
};

const updateClassName = async ({ classCode, className }) => {
  return await http.put(API_URL + "classes/updateClassName/" + classCode, {
    className
  });
};

const removeTeacher = async ({ classCode, teacherId }) => {
  return await http.delete(API_URL + "classes/removeTeacher/" + classCode + "/" + teacherId);
};

const removeStudent = async ({ classCode, studentId }) => {
  return await http.delete(API_URL + "classes/removeStudent/" + classCode + "/" + studentId);
};

const ClassService = {
  createClass,
  listClassesByTeacherId,
  listClassesByStudentId,
  getClassByClassCode,
  getClassByInvitationCode,
  joinClassByLink,
  joinClassByCode,
  listPeopleByClassCode,
  inviteByEmail,
  updateGradeCompositionByClassCode,
  getGradeCompositionByClassCode,
  updateFinalizeInGradeComposition,
  getAllClasses,
  updateClassName,
  removeTeacher,
  removeStudent
}

export default ClassService;