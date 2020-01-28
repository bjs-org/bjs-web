import {getClass, getStudents, postSportResult} from "./api.js";
const active_student = null;

function constructStudentTableRow(student) {
    var modalSportresult = $('#sportresultModal').modal({
                        keyboard: true,
                        show:false
                    });
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
    if(student.female == true){
        gender.innerText = "W";
    }
    else
    {
        gender.innerText = "M";
    }
    row.appendChild(gender);

    let edit = document.createElement("td");
    let buttonEdit = document.createElement("span");
        buttonEdit.onclick = () => {
            modalSportresult.modal('show');
            return false;
        }
    buttonEdit.title = "Edit this student";
    let iconEdit = document.createElement("i");
    iconEdit.className = "fas fa-user-edit";
    buttonEdit.appendChild(iconEdit);
    edit.appendChild(buttonEdit);
    row.appendChild(edit);

    let remove = document.createElement("td");
    let buttonRemove = document.createElement("span");
            buttonRemove.onclick = () => {
               // TODO implement Remove function
        }
    buttonRemove.title = "Remove this student"
    let iconRemove = document.createElement("i");
    iconRemove.className = "fas fa-trash-alt";
    buttonRemove.appendChild(iconRemove);
    remove.appendChild(buttonRemove);
    row.appendChild(remove);

    let addSportResult = document.createElement("td");
    let addSportResultButton = document.createElement("span");
    addSportResultButton.onclick = () => {
                //active_student = $(student);
                modalSportresult.modal('show');
                return false;
         }
    addSportResultButton.title = "Add a Sportresult";
    let iconASR = document.createElement("i");
    iconASR.className = "fas fa-running";
    addSportResultButton.appendChild(iconASR);
    addSportResult.appendChild(addSportResultButton);
    row.appendChild(addSportResult);

    return row;
}

function addSportResult() {
    const errorElement = document.querySelector("#error");
    //const sportresult = {result: document.getElementById("sportResult_result").value ,  discipline: document.getElementById("discipline").value , student: active_student};
    const sportresult = {result: '11.2' ,  discipline: 'RUN_100' , student: 'http://raspberry-balena.gtdbqv7ic1ie9w3s.myfritz.net:8080/api/v1/students/24'};
    postSportResult(sportresult)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successfull.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

$(window).on("load", function () {
    const studentsTableBody = document.querySelector("#students-tbody");
    const errorElement = document.querySelector("#error");
    const classInformation = document.querySelector("#class-information");

    const urlSearchParams = new URLSearchParams(window.location.search);
    const schoolClass = urlSearchParams.get("schoolClass");

    const post = document.getElementById('saveButton');
    post.addEventListener('click', addSportResult ,true);

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


