import {getStudents} from "./api.js";

function constructStudentTableRow(student) {
    let row = document.createElement("tr");

    let firstName = document.createElement("td");
    firstName.innerText = student.firstName;
    row.appendChild(firstName);

    let lastName = document.createElement("td");
    lastName.innerText = student.lastName;
    row.appendChild(lastName);

    let birthday = document.createElement("td");
    birthday.innerText = student.birthDay;
    row.appendChild(birthday);
    return row;
}

$(window).on("load", function () {
    const studentsElement = document.querySelector("#students");
    const errorElement = document.querySelector("#error");
    const urlSearchParams = new URLSearchParams(window.location.search);

    getStudents(urlSearchParams.get("schoolClass"))
        .then(students => {
            students.forEach((student) => {
                let row = constructStudentTableRow(student);
                studentsElement.appendChild(row);
            });
        })
        .catch(err => {
            console.error(err);
            $(errorElement).slideDown("slow").delay(1500).slideUp("slow");
        })
});