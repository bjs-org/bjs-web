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

export async function getStudents(schoolClass) {
    return fetch(`${api_url}/students/search/findAllBySchoolClass?schoolClass=${schoolClass}` , {
        credentials: "include"
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            return data._embedded.students;
        })
}