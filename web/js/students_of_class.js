import {getClass, getStudents} from "./api.js";

function constructStudentTableRow(student) {
    var modalSportresult = $('#sportresultModal').modal({
                        keyboard: true,
                        show:false
                    });
    let row = document.createElement("tr");
        row.onclick = () => {
                modalSportresult.modal('show');
                return false;
        };

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
    if(student.female == true){
        gender.innerText = "W";
    }
    else
    {
        gender.innerText = "M";
    }
    row.appendChild(gender);

    let edit = document.createElement("td");
    let buttonEdit = document.createElement("button");
    buttonEdit.class ="btn btn-default";
    let editSpan = document.createElement("span");
    editSpan.class = "glyphicon glyphicon-pencil";
    edit.appendChild(editSpan);
    edit.appendChild(buttonEdit);
    row.appendChild(edit);


    return row;
}

$(window).on("load", function () {
    const studentsTableBody = document.querySelector("#students-tbody");
    const errorElement = document.querySelector("#error");
    const classInformation = document.querySelector("#class-information");

    const urlSearchParams = new URLSearchParams(window.location.search);
    const schoolClass = urlSearchParams.get("schoolClass");

    getClass(schoolClass)
        .catch(() => {
            errorElement.innerHTML = "This element probably does not exists or is not accessible";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
        .then(value => {
            const className = classInformation.querySelector("#class-name");
            className.innerHTML = `${value.grade}${value.className}`;

            const classTeacher = classInformation.querySelector("#class-teacher");
            classTeacher.innerHTML = value.classTeacherName === undefined ? '' : value.classTeacherName;
        })
        .then(() => {
            getStudents(schoolClass)
                .then(students => {
                    students.forEach((student) => {
                        let row = constructStudentTableRow(student);
                        studentsTableBody.appendChild(row);
                    });
                })
        })


});