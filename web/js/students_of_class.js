import {
    getStudent,
    addStudent,
    deleteSportResult,
    deleteStudent,
    getClass,
    getSportResults,
    getStudents,
    patchSportResult,
    patchStudent,
    postSportResult
} from "./api.js";

let classURL = null;

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


$("#disciplines").on('change', function () {
    const selected = $(this).val();
    if (selected.substring(0, 3) === "RUN") {
        hideTableColumns("isNotRun");
    } else {
        showTableColumns("isNotRun");
    }
});

$('#addSportResultsModal').on('show.bs.modal', function () {
    const studentSportResultsTableBody = document.querySelector("#studentSportResult-tbody");
    const urlSearchParams = new URLSearchParams(window.location.search);
    const schoolClassUrl = urlSearchParams.get("schoolClass");
    getStudents(schoolClassUrl)
        .then(students => {
            students.forEach((student) => {
                let row = constructStudentSportResultTableRow(student);
                studentSportResultsTableBody.appendChild(row);
            })
        });
});

$('#sportResultModal').on('hide.bs.modal', function () {
    clearSportResultTable();
    $("#addSportResultCollapse").collapse('hide');
});

$('#addSportResultsModal').on('hide.bs.modal', function () {
    clearStudentSportResultTable();
    showTableColumns("isNotRun");
});

function createSportResultTable(student , studentURL) {
    const labelScore = document.querySelector("#labelScore");
    labelScore.innerText = `Punkte: ${student.score}`;
    const SportResultsTableBody = document.querySelector("#sportResults-tbody");
    getSportResults(studentURL)
        .then(sportResults => {
            sportResults.forEach((sportResult) => {
                let row = constructSportResultTableRow(sportResult);
                SportResultsTableBody.appendChild(row);
            });
        })
}

function clearStudentSportResultTable() {
    const studentSportResultsTableBody = document.querySelector("#studentSportResult-tbody");
    while (studentSportResultsTableBody.hasChildNodes()) {
        studentSportResultsTableBody.removeChild(studentSportResultsTableBody.firstChild);
    }
}

function clearSportResultTable() {
    const SportResultsTableBody = document.querySelector("#sportResults-tbody");
    while (SportResultsTableBody.hasChildNodes()) {
        SportResultsTableBody.removeChild(SportResultsTableBody.firstChild);
    }
}

function constructStudentSportResultTableRow(student) {
    let row = document.createElement("tr");

    let studentName = document.createElement("td");
    studentName.innerText = student.firstName + "\n" + student.lastName;
    row.appendChild(studentName);

    let sportResult = document.createElement("td");
    let inputSportResult = document.createElement("input");
    inputSportResult.className = "value";
    sportResult.appendChild(inputSportResult);
    row.appendChild(sportResult);

    let sportResult2 = document.createElement("td");
    let inputSportResult2 = document.createElement("input");
    inputSportResult2.className = "value";
    sportResult2.className = "isNotRun";
    sportResult2.appendChild(inputSportResult2);
    row.appendChild(sportResult2);

    let sportResult3 = document.createElement("td");
    let inputSportResult3 = document.createElement("input");
    inputSportResult3.className = "value";
    sportResult3.className = "isNotRun";
    sportResult3.appendChild(inputSportResult3);
    row.appendChild(sportResult3);

    let studentMetaData = document.createElement("input");
    studentMetaData.value = student._links.self.href;
    studentMetaData.className = "student";
    studentMetaData.type = "hidden";
    row.appendChild(studentMetaData);

    return row;
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
        loadEditSportResult(sportResult);
    };
    editSportResultButton.title = "Verändere das Ergebnis.";
    let iconASR = document.createElement("i");
    iconASR.className = "fas fa-edit";
    editSportResultButton.appendChild(iconASR);
    editSportResult.appendChild(editSportResultButton);
    row.appendChild(editSportResult);

    let removeSportResult = document.createElement("td");
    let removeSportResultButton = document.createElement("span");
    removeSportResultButton.onclick = () => {
        removeResult(sportResultURL);
    };
    removeSportResultButton.title = "Lösche dieses Ergebnis.";
    let iconRemove = document.createElement("i");
    iconRemove.className = "fas fa-trash-alt";
    removeSportResultButton.appendChild(iconRemove);
    removeSportResult.appendChild(removeSportResultButton);
    row.appendChild(removeSportResult);

    return row;
}

function loadEditSportResult(sportResult) {
    document.querySelector("#sportResultURL").value = sportResult._links.self.href;
    const discipline = sportResult.discipline;
    const disciplineSelect = document.querySelector("#discipline");
    disciplineSelect.value = discipline;
    document.querySelector("#sportResult_result").value = sportResult.result;
    $('#addSportResultCollapse').collapse('toggle');
}

async function editSportResult(formData) {
    const errorElement = document.querySelector("#error");
    const data = {
        discipline: formData.get("discipline"),
        result: formData.get("result"),
        student: formData.get("studentURL")
    };
    const sportResultURL = formData.get("sportResultURL");
    await patchSportResult(sportResultURL, data)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    reloadModal();

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
    const editModal = document.querySelector("#editStudentModal");
    editModal.querySelector("#editFirstName").value = student.firstName;
    document.querySelector("#editLastName").value = student.lastName;
    document.querySelector("#editBirthday").value = student.birthDay;
    editModal.querySelector("#editFemale").value = student.female ? "female" : "male";
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

    let gender = document.createElement("td");
    gender.innerText = student.female ? "Weiblich" : "Männlich";
    row.appendChild(gender);

    let edit = document.createElement("td");
    let buttonEdit = document.createElement("span");
    buttonEdit.onclick = () => {
        document.querySelector('#editStudentForm > input[name="studentURL"]').value = studentURL;
        loadEditModal(student);
    };
    buttonEdit.title = "Verändere diesen Schüler.";
    let iconEdit = document.createElement("i");
    iconEdit.className = "fas fa-user-edit";
    buttonEdit.appendChild(iconEdit);
    edit.appendChild(buttonEdit);
    row.appendChild(edit);

    let remove = document.createElement("td");
    let buttonRemove = document.createElement("span");
    buttonRemove.onclick = () => {
        document.querySelector("#studentURL").value = studentURL;
        modalDeletion.modal('show');
    };
    buttonRemove.title = "Lösche diesen Schüler.";
    let iconRemove = document.createElement("i");
    iconRemove.className = "fas fa-trash-alt";
    buttonRemove.appendChild(iconRemove);
    remove.appendChild(buttonRemove);
    row.appendChild(remove);

    let addSportResult = document.createElement("td");
    let addSportResultButton = document.createElement("span");
    addSportResultButton.onclick = () => {
        document.querySelector("#studentURL").value = studentURL;
        createSportResultTable(student, studentURL);
        modalSportResult.modal('show');
    };
    addSportResultButton.title = "Ergebnisse des Schülers.";
    let iconASR = document.createElement("i");
    iconASR.className = "fas fa-running";
    addSportResultButton.appendChild(iconASR);
    addSportResult.appendChild(addSportResultButton);
    row.appendChild(addSportResult);

    return row;
}

async function deleteStudentRequest() {
    modalDeletion.modal('hide');
    const errorElement = document.querySelector("#error");
    const student = document.querySelector("#studentURL").value;
    await deleteStudent(student)
        .catch(() => {
            errorElement.innerHTML = "The delete request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    fetchApi();
}

async function addSportResult(formData) {
    const errorElement = document.querySelector("#error");
    const data = {
        discipline: formData.get("discipline"),
        result: formData.get("result"),
        student: formData.get("studentURL")
    };
    await postSportResult(data)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    reloadModal();
}

async function addNewStudent(formData) {
    const errorElement = document.querySelector("#error").value;
    modalAddStudent.modal('hide');
    const data = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        birthDay: formData.get("birthDay"),
        female: formData.get("female") === "female",
        schoolClass: classURL
    };
    await addStudent(data)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    fetchApi();
}

async function editStudent(formData) {
    const errorElement = document.querySelector("#error").value;
    modalEditStudent.modal('hide');
    const data = {
        firstName: formData.get("editFirstName"),
        lastName: formData.get("editLastName"),
        birthDay: formData.get("editBirthDay"),
        female: formData.get("editFemale") === "female"
    };
    const studentURL = formData.get("studentURL");
    await patchStudent(studentURL, data)
        .catch(() => {
            errorElement.innerHTML = "The patch request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    fetchApi();
}

function updateSchoolClass(schoolClass) {
    const className = document.querySelector("#class-name");
    className.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const websiteTitle = document.querySelector("#title");
    websiteTitle.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classBreadCrumb = document.querySelector("#breadCrumb");
    classBreadCrumb.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classTeacher = document.querySelector("#class-teacher");
    classTeacher.innerHTML = schoolClass.classTeacherName || '';

}

function addSportResults() {
    const rows = document.querySelectorAll("#studentSportResult-tbody > tr");
    const errorElement = document.querySelector("#error");
    const discipline = document.querySelector("#disciplines").value;

    Array.from(rows)
        .map((rows) => ({
            student: rows.querySelector(".student").value,
            result:  rows.querySelectorAll(".value")
        }))
        .forEach((row) => {
            const {result} = row;
            const bestResult = Math.max(...Array.from(result)
                .map((value) => value.value));
            const student = row.student;
            const data = {
                discipline: discipline,
                result: bestResult,
                student: student
            };

            if(data.result !== 0){
                postSportResult(data)
                    .catch(() => {
                        errorElement.innerHTML = "The patch request was not successful.";
                        $(errorElement).slideDown().delay(3000).slideUp();
                    });
            }
        });
    fetchApi();
}

async function reloadModal() {
    const studentUrl = document.querySelector("#studentURL").value;
    const student = await getStudent(studentUrl);
    $('#addSportResultCollapse').collapse('hide');
    clearSportResultTable();
    createSportResultTable(student, studentUrl);
}

async function removeResult(sportResult) {
    const errorElement = document.querySelector("#error");
    await deleteSportResult(sportResult)
        .catch(() => {
            errorElement.innerHTML = "The delete request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    reloadModal();
}

function hideTableColumns(className) {
    const elements = document.getElementsByClassName(className);
    Array.from(elements).forEach((element) => {
        element.style.display = "none";
    });
}

function showTableColumns(className) {
    const elements = document.getElementsByClassName(className);
    Array.from(elements).forEach((element) => {
        element.style.display = "";
    })
}

function setupStudentTable(students) {
    const studentsTableBody = document.querySelector("#students-tbody");
    studentsTableBody.querySelectorAll("tr")
        .forEach(row => studentsTableBody.removeChild(row));
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
        classURL = schoolClassUrl;
        const [schoolClass, students] = await Promise.all([getClass(schoolClassUrl), getStudents(schoolClassUrl)]);
        updateSchoolClass(schoolClass);
        setupStudentTable(students);
    } catch (e) {
        errorElement.innerHTML = "This element probably does not exists or is not accessible";
        $(errorElement).slideDown().delay(3000).slideUp();
    }

}

const saveSportResultsButton = document.querySelector("#saveSportResultsButton");
const remove = document.querySelector('#confirmationDelete');
const finish = document.querySelector("#confirmationFinish");
const editStudentForm = document.querySelector("#editStudentForm");
const addStudentForm = document.querySelector("#addStudentForm");
const sportResultForm = document.querySelector("#sportResultForm");
const addSportResultButton = document.querySelector("#addSportResultButton");

sportResultForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const editOrAdd = data.get("sportResultURL");
    if (editOrAdd === "null") {
        addSportResult(data);
    } else {
        editSportResult(data);
    }
});

editStudentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    editStudent(data);
});

addStudentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    addNewStudent(data);
});

saveSportResultsButton.addEventListener('click', function () {
    addSportResults();
});

remove.addEventListener('click', deleteStudentRequest, true);

addSportResultButton.addEventListener('click', function () {
    document.querySelector("#sportResultURL").value = "null";
});

finish.addEventListener('click', function () {

});

fetchApi();



