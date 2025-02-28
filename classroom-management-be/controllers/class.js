const MyClass = require('../models/class');
const Class = MyClass.Class;
const User = require('../models/user');
const Grade = require('../models/grade');
const StatusCodes = require('http-status-codes');
const { ObjectId } = require('mongodb');
const { sendEmailInviteStudent } = require('../utils/sendEmailInviteStudent');
const { sendEmailInviteTeacher } = require('../utils/sendEmailInviteTeacher');
const { Mongoose, default: mongoose } = require('mongoose');

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

function encrypt(text, key) {
  let encryptedText = '';
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    encryptedText += String.fromCharCode(char ^ key);
  }
  return encryptedText;
}

function decrypt(encryptedText, key) {
  return encrypt(encryptedText, key); // XOR operation is its own inverse
}

// Create a new class
const createClass = async (req, res) => {
  try {
    const existingClass = await Class.findOne({
      'teachers.id': req.body.teacherId,
      className: req.body.className
    });

    if (existingClass) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        error: {
          code: "class_exist",
          message: 'Class with the same teacher and class name already exists.',
        },
      });
    }

    const classCode = generateRandomString(16); //16 letters
    // Loop until a unique invitation code is generated
    do {
      invitationCode = generateRandomString(Math.floor(Math.random() * (7 - 5 + 1)) + 5); // 5-7 letters

      // Check if the invitationCode is already in use
      const existingClass = await Class.findOne({ invitationCode });
    } while (existingClass);

    const teacher = await User.findOne({ _id: new ObjectId(req.body.teacherId)});

    const newClass = await Class.create({
      className: req.body.className,
      section: req.body.section,
      subject: req.body.subject,
      room: req.body.room,
      teachers: [
        {
          id: req.body.teacherId,
          name: teacher.name
        }
      ], 
      classOwner: {
        id: req.body.teacherId,
        name: teacher.name,
      },
      classCode: classCode,
      invitationCode: invitationCode,
    });

    await newClass.save();
    newClass.gradeCompositions[0].id = newClass.gradeCompositions[0]._id;
    await newClass.save();
    console.log(newClass);

    return res.status(StatusCodes.CREATED).json({
      status: 201,
      data: newClass,
    });

  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

// List class by teacherId
const listClassesByTeacherId = async (req, res) => {
  try {
    const teacherId = req.params.teacherId; 
    const classes = await Class.find({
      'teachers.id': teacherId
    });

    if (classes.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: "not_found",
          message: "You are not teaching any class.",
        },
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: classes,
    });

  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

// List class by studentId
const listClassesByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId; 
    const classes = await Class.find({
      'students': studentId,
    });

    if (classes.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: "not_found",
          message: "You are not joined any class.",
        },
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: classes,
    });

  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

// Get class detail
const getClassByClassCode = async (req, res) => {
  try {
    const classCode = req.params.classCode; 

    const foundClass = await Class.findOne({ classCode });

    if (!foundClass) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: "not_found",
          message: "Class not found with the classcode :" + classCode,
        },
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: foundClass,
    });

  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

// Join class by invitationCode
const getClassByInvitationCode = async (req, res) => {
  try {
    const invitationCode = req.params.invitationCode; 
    const foundClass = await Class.findOne({ invitationCode });
    const decryptedClassCode = decrypt(invitationCode, 13);
    var data;

    if (!foundClass) {
      const foundClassEncrypted = await Class.findOne({ invitationCode : decryptedClassCode });

      if (!foundClassEncrypted) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          error: {
            code: "not_found",
            message: "Class not found with the invitationCode :" + foundClassEncrypted,
          },
        });
      } else {
        data = {
          teachers: foundClassEncrypted.teachers,
          className: foundClassEncrypted.className,
          classCode: foundClassEncrypted.classCode,
          isTeacher : true
        }
      }
    } else {
      data = {
        teachers: foundClass.teachers,
        className: foundClass.className,
        classCode: foundClass.classCode,
        isTeacher : false
      }
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: data,
    });

  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

const joinClassByLink = async (req, res) => {
  try {
    const { classCode, invitationCode, userId } = req.body;

    const existingClass = await Class.findOne({ classCode : classCode });

    if (!existingClass) {
      return res.status(404).json({
        status: 404,
        error: {
          code: 'not_found',
          message: 'Class not found.',
        },
      });
    }

    // Check if the user is already in the class as a student
    if (existingClass.students.includes(userId)) {
      return res.status(400).json({
        status: 400,
        error: {
          code: 'user_exist',
          message: 'You already exist in the class.',
        },
      });
    }

    // Check if the user is already in the class as a teacher
    if (existingClass.teachers.some(teacher => teacher.id === userId)) {
      return res.status(400).json({
        status: 400,
        error: {
          code: 'user_exist',
          message: 'You already exist in the class as a teacher.',
        },
      });
    }

    const decryptedClassCode = decrypt(invitationCode, 13);
    var isTeacher = false;
    if (decryptedClassCode === existingClass.invitationCode) {
      // Find the user by userId to get the teacher's name
      const teacher = await User.findOne({ _id: userId });
      existingClass.teachers.push({ id: userId, name: teacher.name });
      isTeacher = true;
    } else {
      // Add the student to the students array
      existingClass.students.push(userId);
    }

    await existingClass.save();

    const data = {
      teachers: existingClass.teachers,
      className: existingClass.className,
      classCode: existingClass.classCode,
      isTeacher : true
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: data,
    });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: 'bad_request',
        message: err.message,
      },
    });
  }
};

// Join class by code
const joinClassByCode = async (req, res) => {
  try {
    const { invitationCode, userId } = req.body;

    const existingClass = await Class.findOne({ invitationCode });

    if (!existingClass) {
      return res.status(404).json({
        status: 404,
        error: {
          code: 'not_found',
          message: 'Class not found.',
        },
      });
    }

    // Check if the user is already in the class
    if (existingClass.students.includes(userId)) {
      return res.status(400).json({
        status: 400,
        error: {
          code: 'user_exist',
          message: 'You already exist in the class.',
        },
      });
    }

    // Check if the user is already in the class as a teacher
    if (existingClass.teachers.some(teacher => teacher.id === userId)) {
      return res.status(400).json({
        status: 400,
        error: {
          code: 'user_exist',
          message: 'You already exist in the class as a teacher.',
        },
      });
    }

    existingClass.students.push(userId);
    await existingClass.save();

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: existingClass,
    });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: 'bad_request',
        message: err.message,
      },
    });
  }
};

// Get people by classcode
const getPeopleByClassCode = async (req, res) => {
  try {
    const classCode = req.params.classCode;
    const foundClass = await Class.findOne({ classCode });

    if (!foundClass) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: "not_found",
          message: "Class not found with the classcode: " + classCode,
        },
      });
    }

  // Extract teacher and student ids
  const teacherIds = foundClass.teachers.map(teacher => teacher.id);
  const studentIds = foundClass.students;
  const classOwnerId = foundClass.classOwner.id;

  // Fetch detailed information for teachers and students
  const teachers = await User.find({ _id: { $in: teacherIds } }).select('name email');
  const students = await User.find({ _id: { $in: studentIds } }).select('name email studentId');
  const classOwner = await User.findById(classOwnerId).select('name email');

  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    data: {
      className: foundClass.className,
      teachers: teachers,
      students: students,
      classOwner: classOwner
    },
  });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

//Invite by email 
const inviteByEmail = async (req, res) => {
  try {
    const {email, classCode, isTeacher} = req.body;

    const foundClass = await Class.findOne({ classCode });

    let sendCode = null;
    if (!isTeacher) {
      sendCode = await sendEmailInviteStudent(email, classCode, foundClass.invitationCode, foundClass.teachers[0].name, foundClass.className);
    } else {
      const encryptedText = encrypt(foundClass.invitationCode, 13);
      sendCode = await sendEmailInviteTeacher(email, classCode, encryptedText, foundClass.teachers[0].name, foundClass.className);
    }
    if (sendCode.error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        error: {
          message: 'Failed to send email'
        },
      });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Send email success"
    });
    
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

// Update gradeCompositions by classCode
const updateGradeCompositionByClassCode = async (req, res) => {
  try {
    const { classCode } = req.params;
    const { gradeCompositions } = req.body;

    const foundClass = await Class.findOne({ classCode });

    if (!foundClass) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: "not_found",
          message: "Class not found with the classcode: " + classCode,
        },
      });
    }

    foundClass.gradeCompositions = gradeCompositions;
    for (const gradeComposition of foundClass.gradeCompositions) {
      if (!gradeComposition.id) {
        const id = new ObjectId();
        // console.log("************", id);
        gradeComposition._id = id;
        gradeComposition.id = id.toString();
        foundClass.gradeCompositions.id = id.toString();
      }
    }

    const updatedClass = await foundClass.save();

    //Update grades in grade model
    //if gradeCompositions null --> add, gradeComposition not in gradeCompositions --> delete
    const existingGrades = await Grade.find({ classCode });
    // console.log("existingGrades", existingGrades)
    // console.log("foundClass", foundClass)

    existingGrades.forEach(async (grade) => {
      const { grades } = grade;
      console.log(`Grades: ${JSON.stringify(grades)}`);

      var updatedGrade = [];

      for (const gradeComp of foundClass.gradeCompositions) {
        const gradeCompId = gradeComp.id.toString();
        const matchingGrade = grades.find(g => g.gradeCompositionId.toString() === gradeCompId);

        if (matchingGrade) {
          updatedGrade.push(matchingGrade);
        } else {
          updatedGrade.push({
            gradeCompositionId: gradeCompId,
            grade: 0
          });
        }
      }


      const findGrade = await Grade.findOneAndUpdate(
        { $and: [{ classCode: classCode }, { 'student.studentId': grade.student.studentId }] },
        { $set: { grades: updatedGrade } },
        { new: true }
      );

      // grades.forEach((g) => {
      //   const { gradeCompositionId } = g;
      //   console.log('gradeCompositionId', gradeCompositionId);

      //   for (const gradeCompBody of gradeCompositions) {
      //     //remove

      //     //create new
      //     if (gradeCompBody.id == null) {
            
      //     } else {
      //       if (gradeCompositionId !== gradeCompBody.id.toString()) {
      //         console.log('gradeCompBody.id', gradeCompBody.id);
      //         console.log('gradeCompositionId', gradeCompositionId.toString());
  
      //         const updatedGradesArray = grades.filter(gradeItem => 
      //           gradeItem.gradeCompositionId !== gradeCompBody.id.toString()
      //         );
      //         console.log('grades', grades);
      //         console.log('updatedGradesArray', updatedGradesArray);
      //       }
      //     }

         
      //   }

      // })
    });

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: {
        class: updatedClass
      },
    });
    } catch (err) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        error: {
          code: "bad_request",
          message: err.message,
        },
      });
    }
};

// Get gradeCompositions by classCode
const getGradeCompositionByClassCode = async (req, res) => {
  try {
    const { classCode } = req.params;

    const foundClass = await Class.findOne({ classCode });


    if (!foundClass) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: "not_found",
          message: "Class not found with the classcode: " + classCode,
        },
      });
    }

    const gradeCompositions = foundClass.gradeCompositions;

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: {
        gradeCompositions
      },
    });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

// Get finalize in gradeComposition by classCode
const updateFinalizeInGradeComposition = async (req, res) => {
  try {
    const { gradeCompositionId } = req.body;
    const { classCode } = req.params;

    // Find the class by classCode
    const foundClass = await Class.findOne({ classCode });

    if (!foundClass) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: 'not_found',
          message: 'Class not found',
        },
      });
    }

    // console.log(foundClass)
    console.log(gradeCompositionId)
    // Find the index of the gradeComposition in the gradeCompositions array
    const gradeCompositionIndex = foundClass.gradeCompositions.findIndex(
      (composition) => composition.id === gradeCompositionId
    );
   

    if (gradeCompositionIndex === -1) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: 'not_found',
          message: 'GradeComposition not found',
        },
      });
    }

    // Update the 'finalized' field to true
    foundClass.gradeCompositions[gradeCompositionIndex].finalized = true;

    // Save the updated class document
    await foundClass.save();
    const gradeCompositions = foundClass.gradeCompositions;

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: {
        gradeCompositions
      },
    });
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

// Get all classes
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: classes,
    });

  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      error: {
        code: "bad_request",
        message: err.message,
      },
    });
  }
};

// Update className by classCode
async function updateClassName(req, res) {
  try {
    const { classCode } = req.params;
    const { className } = req.body; 

    if (!className) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: StatusCodes.BAD_REQUEST,
        error: {
          code: 'bad_request',
          message: 'New class name is required.',
        },
      });
    }

    // Find the class by classCode and update the className
    const updatedClass = await Class.findOneAndUpdate(
      { classCode },
      { $set: { className: className } },
      { new: true } // Return the modified document
    );

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: updatedClass,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: {
        code: 'internal_server_error',
        message: err.message,
      },
    });
  }
}

//Remove teacher 
async function removeTeacher(req, res) {
  try {
    const { classCode, teacherId } = req.params;

    // Find the class by classCode
    const foundClass = await Class.findOne({ classCode });

    // Validate that the class exists
    if (!foundClass) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: 'not_found',
          message: 'Class not found.',
        },
      });
    }

    // Remove the teacher by their ID from the teachers array
    foundClass.teachers = foundClass.teachers.filter((teacher) => teacher.id !== teacherId);

    // Save the updated class
    const updatedClass = await foundClass.save();

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: updatedClass,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: {
        code: 'internal_server_error',
        message: err.message,
      },
    });
  }
}

//Remove student
async function removeStudent(req, res) {
  try {
    const { classCode, studentId } = req.params;

    // Find the class by classCode
    const foundClass = await Class.findOne({ classCode });

    // Validate that the class exists
    if (!foundClass) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: StatusCodes.NOT_FOUND,
        error: {
          code: 'not_found',
          message: 'Class not found.',
        },
      });
    }

    // Remove the student by their ID from the students array
    foundClass.students = foundClass.students.filter((student) => student !== studentId);

    // Save the updated class
    const updatedClass = await foundClass.save();

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      data: updatedClass,
    });
  } catch (err) {
    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      error: {
        code: 'internal_server_error',
        message: err.message,
      },
    });
  }
}

module.exports = { 
  createClass,
  listClassesByTeacherId,
  listClassesByStudentId,
  getClassByClassCode,
  getClassByInvitationCode,
  joinClassByLink,
  joinClassByCode,
  getPeopleByClassCode,
  inviteByEmail,
  updateGradeCompositionByClassCode,
  getGradeCompositionByClassCode,
  updateFinalizeInGradeComposition,
  getAllClasses,
  updateClassName,
  removeTeacher,
  removeStudent
};