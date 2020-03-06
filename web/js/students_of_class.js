import {
    addStudent,
    deleteStudent,
    getClass,
    getSportResults,
    getStudents,
    patchSportResult,
    patchStudent,
    postSportResult
} from "./api.js";

const modalDeletion = $('#deletionModal').modal({
    keyboard: true,
    show: false
});

const modalSportResult = $('#sportResultModal').modal({
    keyboard: true,
    show: false
});

const modalAddStudent = $('#addStudentModal').modal({
    keyboard: true,
    show: false
});

const modalEditStudent = $('#editStudentModal').modal({
    keyboard: true,
    show: false
});

let clickCounter = false;

$('#sportResultModal').on('hide.bs.modal', function () {
    ShowHideSaveButton(false);
    clearSportResultTable();
    $("#addSportResultCollapse").collapse('hide');
});

function createSportResultTable(studentURL, student) {
    const labelScore = document.getElementById("labelScore");
    labelScore.innerText = "Punkte: " + student.score;

    const SportResultsTableBody = document.querySelector("#sportResults-tbody");
    getSportResults(studentURL)
        .then(sportResults => {
            sportResults.forEach((sportResult) => {
                let row = constructSportResultTableRow(sportResult);
                SportResultsTableBody.appendChild(row);
            });
        })
}

function clearSportResultTable() {
    const SportResultsTableBody = document.querySelector("#sportResults-tbody");

    while (SportResultsTableBody.hasChildNodes()) {
        SportResultsTableBody.removeChild(SportResultsTableBody.firstChild);
    }
}

function constructSportResultTableRow(sportResult) {
    const sportResultURL = sportResult._links.self.href;
    let row = document.createElement("tr");

    let discipline = document.createElement("td");
    discipline.innerText = changingNamesOfDisciplines(sportResult.discipline);
    row.appendChild(discipline);

    let result = document.createElement("td");
    result.innerText = sportResult.result;
    row.appendChild(result);

    let editSportResult = document.createElement("td");
    let editSportResultButton = document.createElement("span");
    editSportResultButton.onclick = () => {
        document.getElementById("sportResultURL").value = sportResultURL;
        document.getElementById("EditOrAdd").value = "edit";
        if (clickCounter === false) {
            loadEditSportResult(sportResult);
            $("#addSportResultCollapse").collapse('show');
            ShowHideSaveButton(true);
            clickCounter = true;
        } else {
            $("#addSportResultCollapse").collapse('hide');
            ShowHideSaveButton(false);
            clickCounter = false;
        }
    };
    editSportResultButton.title = "Edit this Sportresult.";
    let iconASR = document.createElement("i");
    iconASR.className = "fas fa-edit";
    editSportResultButton.appendChild(iconASR);
    editSportResult.appendChild(editSportResultButton);
    row.appendChild(editSportResult);

    let removeSportResult = document.createElement("td");
    let removeSportResultButton = document.createElement("span");
    removeSportResultButton.onclick = () => {

    };
    removeSportResultButton.title = "Remove this Sportresult.";
    let iconRemove = document.createElement("i");
    iconRemove.className = "fas fa-trash-alt";
    removeSportResultButton.appendChild(iconRemove);
    removeSportResult.appendChild(removeSportResultButton);
    row.appendChild(removeSportResult);

    return row;
}

function loadEditSportResult(sportResult) {
    const discipline = sportResult.discipline;
    $("div.form-group select").removeAttr('selected')
        .find('option[value=' + discipline + ']')
        .attr('selected', true);
    document.getElementById("sportResult_result").value = sportResult.result;
}

function editSportResult() {
    modalSportResult.modal('hide');
    const sportResultURL = document.getElementById("sportResultURL").value;
    const errorElement = document.querySelector("#error");
    const result = document.getElementById("sportResult_result").value;
    const discipline = document.getElementById("discipline").value;
    const sportResult = {result: result, discipline: discipline};
    console.log(sportResultURL);
    patchSportResult(sportResultURL, sportResult)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function changingNamesOfDisciplines(discipline) {
    if (discipline === "RUN_50") {
        return "50 Meter Sprint"
    } else if (discipline === "RUN_75") {
        return "75 Meter Sprint"
    } else if (discipline === "RUN_100") {
        return "100 Meter Sprint"
    } else if (discipline === "RUN_800") {
        return "800 Meter Lauf"
    } else if (discipline === "RUN_2000") {
        return "2000 Meter Lauf"
    } else if (discipline === "RUN_3000") {
        return "3000 Meter Lauf"
    } else if (discipline === "LONG_JUMP") {
        return "Weitsprung"
    } else if (discipline === "HIGH_JUMP") {
        return "Hochsprung"
    } else if (discipline === "BALL_THROWING_80") {
        return "Weitwurf 80 Gramm"
    } else if (discipline === "BALL_THROWING_200") {
        return "Weitwurf 200 Gramm"
    } else if (discipline === "SHOT_PUT") {
        return "Kugelstoßen"
    } else if (discipline === "SLING_BALL") {
        return "Schleuderball"
    } else {
        return "Fehler!"
    }
}

function loadEditModal(student) {
    document.getElementById("editFirstName").value = student.firstName;
    document.getElementById("editLastName").value = student.lastName;
    document.getElementById("editBirthday").value = student.birthDay;
    if (student.female) {
        $("div.form-group select").val("female");
    } else {
        $("div.form-group select").val("male");
    }
    modalEditStudent.modal('show');
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
    gender.innerText = student.female ? "Weiblich" : "Männlich";
    row.appendChild(gender);

    let edit = document.createElement("td");
    let buttonEdit = document.createElement("span");
    buttonEdit.onclick = () => {
        document.getElementById("studentURL").value = studentURL;
        loadEditModal(student);
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
        createSportResultTable(studentURL, student);
        modalSportResult.modal('show');
        return false;
    };
    addSportResultButton.title = "Sportresults of this student";
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
    modalSportResult.modal('hide');
    const errorElement = document.querySelector("#error");
    const result = document.getElementById("sportResult_result").value;
    const discipline = document.getElementById("discipline").value;
    const student = document.getElementById("studentURL").value;
    const sportResult = {result: result, discipline: discipline, student: student};
    postSportResult(sportResult)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function addNewStudent() {
    modalAddStudent.modal('hide');
    const errorElement = document.querySelector("#error");
    const firstName = document.getElementById("addFirstName").value;
    const lastName = document.getElementById("addLastName").value;
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

function stillFemale() {
    const femaleOption = document.getElementById("editFemale");
    if (femaleOption.value === "female") {
        return true;
    } else if (femaleOption.value === "male") {
        return false;
    }
}

function editOrAdd() {
    const editOption = document.getElementById("EditOrAdd");
    if (editOption.value === "edit") {
        return true;
    } else if (editOption.value === "add") {
        return false;
    }
}

function editStudent() {
    modalEditStudent.modal('hide');
    const errorElement = document.querySelector("#error").value;
    const editFirstName = document.getElementById("editFirstName").value;
    const editLastName = document.getElementById("editLastName").value;
    const editBirthday = document.getElementById("editBirthday").value;
    const editFemale = stillFemale();
    const edits = {firstName: editFirstName, lastName: editLastName, birthDay: editBirthday, female: editFemale};
    const studentURL = document.getElementById("studentURL").value;
    patchStudent(studentURL, edits)
        .catch(() => {
            errorElement.innerHTML = "The patch request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function ShowHideSaveButton(promise) {
    promise ? document.getElementById("saveSportResultButton").style.visibility = 'visible' : document.getElementById("saveSportResultButton").style.visibility = 'hidden';
}

function updateSchoolClass(schoolClass) {
    const className = document.getElementById("class-name");
    className.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classTitle = document.getElementById("title");
    classTitle.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classBreadCrumb = document.getElementById("breadCrumb");
    classBreadCrumb.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classTeacher = document.getElementById("class-teacher");
    classTeacher.innerHTML = schoolClass.classTeacherName || '';

    document.getElementById("classURL").value = schoolClass._links.self.href;
}

function setupStudentTable(students) {
    const studentsTableBody = document.querySelector("#students-tbody");
    students.forEach((student) => {
        let row = constructStudentTableRow(student);
        studentsTableBody.appendChild(row);
    });
}

async function fetchApi() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const errorElement = document.querySelector("#error");
    const schoolClassUrl = urlSearchParams.get("schoolClass");

    try {
        const [schoolClass, students] = await Promise.all([getClass(schoolClassUrl), getStudents(schoolClassUrl)]);

        updateSchoolClass(schoolClass);
        setupStudentTable(students);

    } catch (e) {
        errorElement.innerHTML = "This element probably does not exists or is not accessible";
        $(errorElement).slideDown().delay(3000).slideUp();
    }

}

$(window).on("load", function () {
    const SportResultSaveButton = document.getElementById("saveSportResultButton");
    SportResultSaveButton.style.visibility = "hidden";
    const post = document.getElementById('saveSportResultButton');
    post.addEventListener('click', function () {
        const editOrAddSportResult = editOrAdd();
        if (editOrAddSportResult) {
            editSportResult();
        } else {
            addSportResult();
        }
    }, true);
    const remove = document.getElementById('confirmationDelete');
    remove.addEventListener('click', deleteStudentRequest, true);
    const addSportResultButton = document.getElementById("addSportResultButton");
    addSportResultButton.addEventListener('click', function () {
        if (document.getElementById("saveSportResultButton").style.visibility === 'hidden') {
            ShowHideSaveButton(true);
        } else {
            ShowHideSaveButton(false);
        }
    }, true);
    const edit = document.getElementById("confirmationEdit");
    edit.addEventListener('click', editStudent, true);
    const addStudent = document.getElementById('confirmationAdd');
    addStudent.addEventListener('click', addNewStudent, true);

    fetchApi();
});



