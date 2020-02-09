import {addStudent, deleteStudent, getClass, getStudents, patchStudent, postSportResult, getSportResults} from "./api.js";

const modalDeletion = $('#deletionModal').modal({
    keyboard: true,
    show: false
});

const modalSportresult = $('#sportresultModal').modal({
    keyboard: true,
    show: false
});

const modalAddStudent = $('#addstudentModal').modal({
    keyboard: true,
    show: false
});

function createSportResultTable(student) {
    const errorElement = document.querySelector("#error");
    const SportResultsTableBody = document.querySelector("#sportResults-tbody");
    getSportResults(student)
    .then(sportResults => {
        sportResults.forEach((sportResult) => {
            let row = constructSportResultTableRow(sportResult);
            SportResultsTableBody.appendChild(row);
        });
    })
}

function clearSportResultTable() {
    const SportResultsTableBody = document.querySelector("#sportResults-tbody");

    while(SportResultsTableBody.hasChildNodes()){
        SportResultsTableBody.removeChild(SportResultsTableBody.firstChild);
    }
}

function constructSportResultTableRow(sportResult) {
    let row = document.createElement("tr");

    let discipline = document.createElement("td");
    discipline.innerText = sportResult.discipline;
    row.appendChild(discipline);

    let result = document.createElement("td");
    result.innerText = sportResult.result;
    row.appendChild(result);

    return row;
}

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
    birthday.innerText = new Date(student.birthDay).toLocaleDateString();
    row.appendChild(birthday);

    let score = document.createElement("td");
    score.innerText = student.score;
    row.appendChild(score);

    let gender = document.createElement("td");
    gender.innerText = student.female ?  "Weiblich" : "Männlich";
    row.appendChild(gender);

    let edit = document.createElement("td");
    let buttonEdit = document.createElement("span");


    buttonEdit.onclick = () => {
        //modalSportresult.modal('show');
        //return false;
        document.getElementById("studentURL").value = studentURL;
        editStudent();
    };
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
    };
    buttonRemove.title = "Remove this student";
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
        createSportResultTable(studentURL);

        return false;
    };
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
    const result = document.getElementById("sportResult_result").value;
    const discipline = document.getElementById("discipline").value;
    const student = document.getElementById("studentURL").value;
    const sportresult = {result: result, discipline: discipline, student: student};
    postSportResult(sportresult)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function addNewStudent() {
    modalAddStudent.modal('hide');
    const errorElement = document.querySelector("#error");
    const firstName = document.getElementById("addFirstname").value;
    const lastName = document.getElementById("addLastname").value;
    const birthDay = document.getElementById("addBirthday").value;
    const female = isFemale();
    const schoolClass = document.getElementById("classURL").value;

    const newStudent = {
        firstName: firstName,
        lastName: lastName,
        birthDay: birthDay,
        female: female,
        schoolClass: schoolClass
    };
    addStudent(newStudent)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function isFemale() {
    const femaleOption = document.getElementById("addFemale");
    if (femaleOption.value === "female") {
        return true;
    } else if (femaleOption.value === "male") {
        return false;
    }
}

function editStudent() {
    const errorElement = document.querySelector("#error");
    const edits = {firstName: "Patch", lastName: "Test", birthDay: "2001-04-20", female: true};
    const studentURL = document.getElementById("studentURL").value;
    patchStudent(studentURL, edits)
        .catch(() => {
            errorElement.innerHTML = "The patch request was not successful.";
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
    post.addEventListener('click', addSportResult, true);
    post.addEventListener('click', clearSportResultTable, true);

    const closeSportResult = document.getElementById("closeSportResult");
    closeSportResult.addEventListener('click', clearSportResultTable, true);

    const remove = document.getElementById('confirmationDelete');
    remove.addEventListener('click', deleteStudentRequest, true);

    //const edit = document.getElementById("editStudentButton");
    //edit.addEventListener('click',editStudent,true);

    const addStudent = document.getElementById('confirmationAdd');
    addStudent.addEventListener('click', addNewStudent, true);

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


