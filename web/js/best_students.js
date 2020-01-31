import {getScore, getTopStudents} from "./api.js";

function BuildBestStudentsTable(grade) {
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

        let gender = document.createElement("td");
        if(student.female === true){
            gender.innerText = "W";
        }
        else
        {
            gender.innerText = "M";
        }
        row.appendChild(gender);
}