const default_url = "http://raspberry-balena.gtdbqv7ic1ie9w3s.myfritz.net:8080/api/v1"
const relativ_url = "/api/v1"
let api_url = determineApiUrl();

async function determineApiUrl() {
    let response = await fetch(relativ_url);
    if (response.status === 404) return default_url;
    return relativ_url;
}

export async function getClasses() {
    const response = await fetch(`${await api_url}/classes`, {
        credentials: "include"
    });
    const json = await response.json();
    const classes = json._embedded.classes;
    classes.sort((a, b) => {
        const compareClassName = a.grade.localeCompare(b.grade, undefined, {numeric: true});
        if (compareClassName === 0) {
            return a.className.localeCompare(b.className);
        }
        return compareClassName;
    });
    return classes;
}

export async function getClass(schoolClass) {
    return fetch(schoolClass, {
        credentials: "include"
    })
        .then(response => response.json());
}

export async function getSportResults(student) {
    return fetch(`${student}/sportResults`, {
        credentials: "include"
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data._embedded.sport_results;
        })
}

export async function getStudents(schoolClass) {
    return fetch(`${schoolClass}/students?projection=calculation`, {
        credentials: "include"
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data._embedded.students;
        })
        .then(data => {
            return data.sort((a, b) => {
                const compareLastName = a.lastName.localeCompare(b.lastName);
                if (compareLastName === 0) {
                    return a.firstName.localeCompare(b.firstName);
                }
                return compareLastName;
            })
        })
}

export async function patchStudent(student, data) {
    fetch(`${student}`, {
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
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function patchSportResult(sportResult, data) {
    fetch(`${sportResult}`, {
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
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function addStudent(student_data) {
    fetch(`${await api_url}/students`, {
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
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function postSportResult(sportresult) {
    fetch(`${await api_url}/sport_results`, {
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
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function deleteStudent(student) {
    return fetch(`${student}`, {
        credentials: "include",
        method: 'DELETE',
    })
        .then((data) => {
            console.log('Success', data);
            location.reload();
        })
        .catch((error) => {
            console.error('Error', error);
        })
}

export async function deleteSportResult(sportResult) {
    return fetch(`${sportResult}`, {
        credentials: "include",
        method: 'DELETE',
    })
        .then((data) => {
            console.log('Success', data);
            location.reload();
        })
        .catch((error) => {
            console.error('Error', error);
        })
}

export async function getTopStudents(grade) {
    return fetch(`${await api_url}/students/best/${grade}`, {
        credentials: "include",
        method: 'GET',
    })
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error', error);
        })
}