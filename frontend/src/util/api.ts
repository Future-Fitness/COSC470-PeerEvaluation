import { didExpire, getToken, removeToken } from "./login";

const BASE_URL = 'http://localhost:5008'

// Re-export commonly used functions from login module
export { getToken, removeToken }

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  isTeacher: boolean;
}

export interface Class {
  id: number;
  name: string;
  teacherID: number;
}

export interface Assignment {
  id: number;
  courseID: number;
  name: string;
  rubric?: any; // Rubric details can be more specific later if needed
}

export interface Submission {
  id: number;
  assignmentID: number;
  userID: number;
  fileURL: string;
  submittedAt: string; // ISO date string
}

export interface SubmissionsWithUser extends Submission {
  username: string;
  email: string;
}

// Get current user's profile
export const getMyProfile = async (): Promise<UserProfile> => {
  const resp = await fetch(`${BASE_URL}/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}

// Get any user's profile by ID
export const getProfile = async (id: string): Promise<UserProfile> => {
  const resp = await fetch(`${BASE_URL}/profile/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}


export const maybeHandleExpire = (response: Response) => {
  if (didExpire(response)) {
    // Remove the token
    removeToken();

    window.location.href = '/';
  }
}

export const tryLogin = async (username: string, password: string) => {
  const credentials = btoa(`${username}:${password}`);

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      headers: {
        "Authorization": `Basic ${credentials}`
      }
    });

    if (!response.ok) {
      // Return error object if login fails
      return { error: true, message: 'Invalid username or password' };
    }

    const json = await response.json();

    // Store the token
    localStorage.setItem('user', JSON.stringify(json));

    return json;
  } catch (error) {
    // Network or other error
    console.error(error);
    return { error: true, message: 'Network error. Please try again.' };
  }
}

export const createClass = async (name: string): Promise<Class> => {
  const response = await fetch(`${BASE_URL}/create_class`, {
    method: 'POST',
    body: JSON.stringify({
      name,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
  })

  maybeHandleExpire(response);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  return await response.json()
}

export const getClasses = async (): Promise<Class[]> => {
  const resp = await fetch(`${BASE_URL}/classes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  })

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json()
}

export const importStudentsForCourse = async (courseID: number, students: string) => {
  const response = await fetch(`${BASE_URL}/student_import`, {
    method: 'POST',
    body: JSON.stringify({
      students,
      courseID,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
  })

  maybeHandleExpire(response);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
}

export const getAssignments = async (courseId: number): Promise<Assignment[]> => {
  const resp = await fetch(`${BASE_URL}/assignments/${courseId}`, {
    method: 'GET',
    headers: {
       'Authorization': `Bearer ${getToken()}`,
       'Content-Type': 'application/json',
    },
  })
  
  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json()
}

export const listStuGroup = async (assignmentId : number, studentId : number) => {
  const resp = await fetch(`${BASE_URL}/list_stu_groups/`+ assignmentId + "/" + studentId, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
   },
  })

  maybeHandleExpire(resp);


  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json()
} 

export const listGroups = async (assignmentId : number) => {
  const resp = await fetch(`${BASE_URL}/list_all_groups/` + assignmentId, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
   },
  })
  maybeHandleExpire(resp);


  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }
  
  return await resp.json()
} 

export const listUnassignedGroups = async (assignmentId : number) => {
  const resp = await fetch(`${BASE_URL}/list_ua_groups/` + assignmentId, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
   },
  })

  maybeHandleExpire(resp);

  return await resp.json()
}

export const listCourseMembers = async (classId: string) => {
  const resp = await fetch(`${BASE_URL}/classes/members`, {
    method: 'POST',
    body: JSON.stringify({
      id: classId,
    }),
    headers: {
       'Authorization': `Bearer ${getToken()}`,
       'Content-Type': 'application/json',
    },
  })
  
  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }
  
  return await resp.json()
} 


/*
export const getClassName = async (classId: string) => {
  const resp = await fetch(`${BASE_URL}/get_class/${classId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  const data = await resp.json();
  return data.className;
};
*/

export const getClassName = async (classId: string) => {
  const resp = await fetch(`${BASE_URL}/get_className/${classId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }
  return await resp.json();
};

export const listGroupMembers = async (assignmentId : number, groupID: number) => {
  const resp = await fetch(`${BASE_URL}/list_group_members/` + assignmentId + '/' + groupID, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
   },
  })

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }
  
  return await resp.json()
} 

export const getUserId = async () => {
  const resp = await fetch(`${BASE_URL}/user_id`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
   },
  })

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }
  
  return await resp.json()
} 

export const saveGroups = async (groupID: number, userID: number, assignmentID : number) =>{
  const response = await fetch(`${BASE_URL}/save_groups`, {
    method: 'POST',
    body: JSON.stringify({
      groupID,
      userID,
      assignmentID
    }),
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
   },
  })

  maybeHandleExpire(response);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
}

export const getCriteria = async (rubricID: number) => {
  const resp = await fetch(`${BASE_URL}/criteria?rubricID=${rubricID}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  })

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json()
}

export const createCriteria = async (rubricID: number, question: string, scoreMax: number, canComment: boolean, hasScore: boolean = true) => {
  const response = await fetch(`${BASE_URL}/create_criteria`, {
    method: 'POST',
    body: JSON.stringify({
      rubricID, question, scoreMax, canComment, hasScore
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
  })

  maybeHandleExpire(response);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
}

export const createRubric = async (id: number, assignmentID: number, canComment: boolean): Promise<{ id: number }> => {
  const response = await fetch(`${BASE_URL}/create_rubric`, {
    method: 'POST',
    body: JSON.stringify({
      id, assignmentID, canComment
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
  })

  maybeHandleExpire(response);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  return await response.json();
}

export const getRubric = async (rubricID: number) => {
  const resp = await fetch(`${BASE_URL}/rubric?rubricID=${rubricID}`, {
      headers: {
          'Authorization': `Bearer ${getToken()}`
      }
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
      throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}


export const createAssignment = async (courseID: number, name: string)=> {
  const response = await fetch(`${BASE_URL}/create_assignment`, {
    method: 'POST',
    body: JSON.stringify({
      courseID, name
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
  })
  
  maybeHandleExpire(response);

  if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
  }

  return await response.json();
}

export const deleteGroup = async (groupID: number) => {
  const response = await fetch(`${BASE_URL}/delete_group`, {
    method: 'POST',
    body: JSON.stringify({
      groupID,
    }),
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
   },
  })

  maybeHandleExpire(response);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
}

export const createReview = async (assignmentID: number, reviewerID: number, revieweeID: number) => {
  const response = await fetch(`${BASE_URL}/create_review`, {
    method: 'POST',
    body: JSON.stringify({
      assignmentID,
      reviewerID,
      revieweeID,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
  })

  maybeHandleExpire(response);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  return response
}

export const createCriterion = async (reviewID: number, criterionRowID: number, grade: number, comments: string) => {
  const response = await fetch(`${BASE_URL}/create_criterion`, {
    method: 'POST',
    body: JSON.stringify({
      reviewID,
      criterionRowID,
      grade,
      comments,
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
  })

  maybeHandleExpire(response);

  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  return response
}

export const getReview = async (assignmentID: number, reviewerID: number, revieweeID: number) => {
  const resp = await fetch(`${BASE_URL}/review?assignmentID=${assignmentID}&reviewerID=${reviewerID}&revieweeID=${revieweeID}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  })

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return resp
}

export const getNextGroupID = async(assignmentID: number)=> {
  const response = await fetch(`${BASE_URL}/next_groupid?assignmentID=${assignmentID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    }
  })

  maybeHandleExpire(response);

  if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
  }

  return await response.json();
}

export const createGroup = async(assignmentID: number, name: string, id: number) =>{
  const response = await fetch(`${BASE_URL}/create_group`,{
    method:"POST",
    body: JSON.stringify({
      assignmentID, name, id
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    }
  })
  maybeHandleExpire(response);

  if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
  }

  return await response.json();
}

export const uploadSubmission = async (assignmentID: number, file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('assignmentID', assignmentID.toString());

  const response = await fetch(`${BASE_URL}/upload_submission`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${getToken()}`
      // Do NOT set 'Content-Type': 'multipart/form-data' here; browser handles it automatically with FormData
    },
  });

  maybeHandleExpire(response);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Response status: ${response.status}`);
  }

  return await response.json();
}

export const getMySubmission = async (assignmentID: number): Promise<Submission | null> => {
  const resp = await fetch(`${BASE_URL}/my_submission/${assignmentID}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  maybeHandleExpire(resp);

  if (resp.status === 404) {
    return null; // No submission found
  }

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}

export const getAssignmentById = async (assignmentID: number): Promise<Assignment> => {
  const resp = await fetch(`${BASE_URL}/assignments/${assignmentID}/details`, { // Assuming a dedicated endpoint for single assignment details
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}

// Student management APIs
export interface Student {
  id: number;
  name: string;
  email: string;
}

export const getAllStudents = async (): Promise<Student[]> => {
  const resp = await fetch(`${BASE_URL}/students`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}

export const getAvailableStudents = async (courseId: string): Promise<Student[]> => {
  const resp = await fetch(`${BASE_URL}/students/available/${courseId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}

export const getEnrolledStudents = async (courseId: string): Promise<Student[]> => {
  const resp = await fetch(`${BASE_URL}/students/enrolled/${courseId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}

export const addStudentsToClass = async (courseId: number, studentIds: number[]) => {
  const resp = await fetch(`${BASE_URL}/add_students_to_class`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ courseId, studentIds })
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}

export const removeStudentsFromClass = async (courseId: number, studentIds: number[]) => {
  const resp = await fetch(`${BASE_URL}/remove_students_from_class`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ courseId, studentIds })
  });

  maybeHandleExpire(resp);

  if (!resp.ok) {
    throw new Error(`Response status: ${resp.status}`);
  }

  return await resp.json();
}