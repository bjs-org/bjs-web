const default_url = "http://raspberry-balena.gtdbqv7ic1ie9w3s.myfritz.net:8080/api/v1";
const relative_url = "/api/v1";
let api_url = determineApiUrl();

async function determineApiUrl() {
    let response = await fetch(relative_url);
    if (!response.ok || response.status === 404) return default_url;
    return relative_url;
}

export async function postUser(user) {
    const response = await fetch(`${await api_url}/users`, {
        credentials: "include",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    const json = await response.json();
    return json;
}

export async function postPrivilege(privilege) {
    const response = await fetch(`${await api_url}/user_privileges`, {
        credentials: "include",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(privilege),
    });
    const json = await response.json();
    return json;
}

export async function patchUser(url, user) {
    const response = await fetch(url, {
        credentials: "include",
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    const json = await response.json();
    return json;
}

export async function getAccessibleClasses(user) {
    const privilegesUrl = user._links.userPrivileges.href;
    const response = await fetch(privilegesUrl, {
        credentials: "include"
    });

    const json = await response.json();
    const { user_privileges } = json._embedded;

    const accessibleClasses = await Promise.all(user_privileges.map(userPrivilege => fetch(userPrivilege._links.accessibleClass.href, {
        credentials: "include"
    }).then(response => response.json())));

    return accessibleClasses;
}

export async function getUsers() {
    const response = await fetch(`${await api_url}/users`, {
        credentials: "include",
        method: 'GET',
    });

    const json = await response.json();
    const users = json._embedded.users;
    users.sort((a, b) => a.username.localeCompare(b.username))
    return users;
}

export async function getClasses() {
    const response = await fetch(`${await api_url}/classes`, {
        credentials: "include"
    });
    const json = await response.json();
    const classes = json._embedded.classes;
    classes.sort((a, b) => {
        const compareGrade = a.grade.localeCompare(b.grade, undefined, { numeric: true });
        if (compareGrade === 0) {
            return a.className.localeCompare(b.className);
        }
        return compareGrade;
    });
    return classes;
}

export async function getStudent(student) {
    const response = await fetch(`${student}?projection=calculation`,{
        credentials: "include"
    });
    return await response.json();
}

export async function getClass(schoolClass) {
    const response = await fetch(schoolClass, {
        credentials: "include"
    });
    return await response.json();
}

export async function getSportResults(student) {
    const response = await fetch(`${student}/sportResults`, {
        credentials: "include"
    });
    const json = await response.json();
    return json._embedded.sport_results;
}

export async function getStudents(schoolClass) {
    const response = await fetch(`${schoolClass}/students?projection=calculation`, {
        credentials: "include"
    });
    const json = await response.json();
    const students = json._embedded.students;
            students.sort((a, b) => {
                const compareLastName = a.lastName.localeCompare(b.lastName);
                if (compareLastName === 0) {
                    return a.firstName.localeCompare(b.firstName);
                }
                return compareLastName;
            });
    return students;
}

export async function patchStudent(student, data) {
    await fetch(`${student}`, {
        credentials: "include",
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function patchClosed(schoolClass, data){
    await fetch(`${schoolClass}`, {
        credentials: "include",
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error', error);
        })
}

export async function patchSportResult(sportResult, data) {
     await fetch(`${sportResult}`, {
        credentials: "include",
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function addStudent(student_data) {
    await fetch(`${await api_url}/students`, {
        credentials: "include",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(student_data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function postSportResult(sportresult) {
    await fetch(`${await api_url}/sport_results`, {
        credentials: "include",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sportresult),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function deleteStudent(student) {
    await fetch(`${student}`, {
        credentials: "include",
        method: 'DELETE',
    })
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error', error);
        })
}

export async function deleteUser(user) {
    return fetch(`${user}`, {
        credentials: "include",
        method: 'DELETE',
    })
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error', error);
        })
}

export async function deleteSportResult(sportResult) {
    await fetch(`${sportResult}`, {
        credentials: "include",
        method: 'DELETE',
    })
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error', error);
        })
}

export async function getTopStudents(grade) {
    const response = await fetch(`${await api_url}/students/best/${grade}`, {
        credentials: "include",
        method: 'GET',
    });
    return await response.json();
}

export async function addClass(data) {
    await fetch(`${await api_url}/classes`, {
        credentials: "include",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error', error);
        })
}

export async function editClass(data, schoolClass) {
    await fetch(`${schoolClass}`, {
        credentials: "include",
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error', error);
        })
}