const api_url = "http://raspberry-balena.gtdbqv7ic1ie9w3s.myfritz.net:8080/api/v1";

export async function getClasses() {
    return fetch(`${api_url}/classes`, {
        credentials: "include"
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data._embedded.classes;
        })
}

export async function getClass(schoolClass) {
    return fetch(schoolClass, {
        credentials: "include"
    })
        .then(response => response.json());
}

export async function getStudents(schoolClass) {
    return fetch(`${api_url}/students/search/findAllBySchoolClass?schoolClass=${schoolClass}`, {
        credentials: "include"
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data._embedded.students;
        })
}

export async function patchStudent(student, data) {
    fetch(`${student}`,{
        credentials: "include",
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((response)    => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error:', error);
    })
}

export async function addStudent(student_data)  {
    fetch(`${api_url}/students`,    {
        credentials: "include",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(student_data),
    })
        .then((response)    => response.json())
        .then((data) => {
            console.log('Success', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        })
}

export async function postSportResult(sportresult) {
    fetch(`${api_url}/sport_results`, {
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
   return fetch(`${student}`,   {
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

export async function getScore(student) {
    return fetch(`${student}/score`,   {
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

export async function getTopStudents(grade){
    return fetch(`${api_url}/students/best/${grade}`,{
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