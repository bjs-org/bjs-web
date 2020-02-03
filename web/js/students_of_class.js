import {getClass, getStudents, postSportResult, deleteStudent, addStudent, patchStudent} from "./api.js";

const modalDeletion = $('#deletionModal').modal({
    keyboard: true,
    show: false
});

const modalSportresult = $('#sportresultModal').modal({
    keyboard: true,
    show:false
});

const modalAddStudent = $('#addstudentModal').modal({
    keyboard: true,
    show:false
});

function constructStudentTableRow(student) {
   const studentURL = student._links.self.href;

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

    let score = document.createElement("td");
    score.innerText = getStudentsScore(studentURL);
    row.appendChild(score);

    let gender = document.createElement("td");
    if(student.female === true){
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
            //modalSportresult.modal('show');
            //return false;
            document.getElementById("studentURL").value = studentURL
            editStudent();
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
                document.getElementById("studentURL").value = studentURL;
                modalDeletion.modal('show');
                return false;
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
                document.getElementById("studentURL").value = studentURL;
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
function deleteStudentRequest() {
    modalDeletion.modal('hide');
    const errorElement = document.querySelector("#error");
    const student = document.getElementById("studentURL").value;
    deleteStudent(student)
        .catch(() => {
            errorElement.innerHTML = "The delete request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function addSportResult() {
    modalSportresult.modal('hide');
    const errorElement = document.querySelector("#error");
    const sportresult = {result: document.getElementById("sportResult_result").value ,  discipline: document.getElementById("discipline").value , student: document.getElementById("studentURL").value};
    postSportResult(sportresult)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function addNewStudent(){
    const errorElement = document.querySelector("#error");
    const newStudent = {firstName: "Platz", lastName: "Halter", birthDay: "2020-01-29", female: false, schoolClass: document.getElementById("classURL").value};
    addStudent(newStudent)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function editStudent(){
    const errorElement = document.querySelector("#error");
    const edits = {firstName: "Patch", lastName: "Test", birthDay: "2001-04-20", female: true};
    const studentURL = document.getElementById("studentURL").value;
    patchStudent(studentURL,edits)
        .catch(() => {
            errorElement.innerHTML = "The patch request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function getStudentsScore(studentURL){
   return getScore(studentURL).toString();
}

$(window).on("load", function () {
    const studentsTableBody = document.querySelector("#students-tbody");
    const errorElement = document.querySelector("#error");
    const classInformation = document.querySelector("#class-information");

    const urlSearchParams = new URLSearchParams(window.location.search);
    const schoolClass = urlSearchParams.get("schoolClass");

    const post = document.getElementById('saveButton');
    post.addEventListener('click', addSportResult ,true);

    const remove = document.getElementById('confirmationDelete');
    remove.addEventListener('click', deleteStudentRequest, true);

    //const edit = document.getElementById("editStudentButton");
    //edit.addEventListener('click',editStudent,true);

    const addStudent = document.getElementById('addStudentButton');
    addStudent.addEventListener('click',addNewStudent, true);

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

            const classURL = value._links.self.href;
            document.getElementById("classURL").value = classURL;
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


