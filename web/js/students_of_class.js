import {
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

let clickCounter = false;

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

const modalSportResults = $('#addSportResultsModal').modal({
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
    clickCounter = false;
    clearSportResultTable();
    $("#addSportResultCollapse").collapse('hide');
});

$('#sportResultModal').on('show.bs.modal', function () {
    document.getElementById("saveSportResultButton").hidden = true;
    clickCounter = false;
});

$('#addSportResultsModal').on('hide.bs.modal', function () {
    clearStudentSportResultTable();
    showTableColumns("isNotRun");
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

    let studentURL = document.createElement("td");
    let studentURLInput = document.createElement("input");
    studentURLInput.innerText = student._links.self.href;
    studentURLInput.className = "student";
    studentURL.appendChild(studentURLInput);
    studentURL.style.display = "none";
    row.appendChild(studentURL);

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
        document.getElementById("sportResultURL").value = sportResultURL;
        document.getElementById("EditOrAdd").value = "edit";
        const sportResultButton = document.getElementById("saveSportResultButton");
        if (clickCounter === false) {
            loadEditSportResult(sportResult);
            $("#addSportResultCollapse").collapse('show');
            sportResultButton.hidden = !sportResultButton.hidden;
            clickCounter = true;
        } else {
            $("#addSportResultCollapse").collapse('hide');
            sportResultButton.hidden = !sportResultButton.hidden;
            clickCounter = false;
        }
    };
    editSportResultButton.title = "Edit this sportresult.";
    let iconASR = document.createElement("i");
    iconASR.className = "fas fa-edit";
    editSportResultButton.appendChild(iconASR);
    editSportResult.appendChild(editSportResultButton);
    row.appendChild(editSportResult);

    let removeSportResult = document.createElement("td");
    let removeSportResultButton = document.createElement("span");
    removeSportResultButton.onclick = () => {
        document.getElementById("sportResultURL").value = sportResultURL;
        removeResult();
    };
    removeSportResultButton.title = "Remove this sportresult.";
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
    document.querySelector("#sportResult_result").value = sportResult.result;
}

function editSportResult() {
    modalSportResult.modal('hide');
    const sportResultURL = document.getElementById("sportResultURL").value;
    const errorElement = document.querySelector("#error");
    const result = document.getElementById("sportResult_result").value;
    const discipline = document.getElementById("discipline").value;
    const sportResult = {result: result, discipline: discipline};
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
    buttonEdit.title = "Edit this student";
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
        document.querySelector("#studentURL").value = studentURL;
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

async function deleteStudentRequest() {
    modalDeletion.modal('hide');
    const errorElement = document.querySelector("#error");
    const student = document.querySelector("#studentURL").value;
    console.log(student);
    await deleteStudent(student)
        .catch(() => {
            errorElement.innerHTML = "The delete request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    await fetchApi();
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
        });
}

async function addNewStudent(formData) {
    const errorElement = document.querySelector("#error").value;
    modalAddStudent.modal('hide');
    const data = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        birthDay: formData.get("birthDay"),
        female: formData.get("female") === "female",
        schoolClass: formData.get("schoolClass")
    };
    await addStudent(data)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    await fetchApi();
}

function editOrAdd() {
    const editOption = document.querySelector("#EditOrAdd");
    if (editOption.value === "edit") {
        return true;
    } else if (editOption.value === "add") {
        return false;
    }
}

async function editStudent(formData) {
    const errorElement = document.querySelector("#error").value;
    modalEditStudent.modal('hide');
    console.log(formData);
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
    await fetchApi();
}

function updateSchoolClass(schoolClass) {
    const className = document.querySelector("#class-name");
    className.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classTitle = document.querySelector("#title");
    classTitle.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classBreadCrumb = document.querySelector("#breadCrumb");
    classBreadCrumb.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classTeacher = document.querySelector("#class-teacher");
    classTeacher.innerHTML = schoolClass.classTeacherName || '';

    document.getElementById("classURL").value = schoolClass._links.self.href;
}

function addSportResults() {
    const table = document.getElementsByClassName("value");
    const students = document.getElementsByClassName("student");
    const errorElement = document.querySelector("#error");
    let start = 0;
    let end = 3;
    Array.from(students).forEach((student) => {
        const result = SortArray(Array.from(table).slice(start, end));
        start = start + 3;
        end = end + 3;
        if (result !== "") {
            const discipline = document.getElementById("disciplines").value;
            const sportResult = {result: result, discipline: discipline, student: student.innerText};
            postSportResult(sportResult)
                .catch(() => {
                    errorElement.innerHTML = "The post request was not successful.";
                    $(errorElement).slideDown().delay(3000).slideUp();
                })
        }
    });
}

function removeResult() {
    const errorElement = document.querySelector("#error");
    const sportResult = document.querySelector("#sportResultURL").value;
    deleteSportResult(sportResult)
        .catch(() => {
            errorElement.innerHTML = "The delete request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        })
}

function SortArray(array) {
    const value = new Array(3);
    value[0] = array[0].value;
    value[1] = array[1].value;
    value[2] = array[2].value;
    const final = value.sort();
    return final[2];
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

function saveUrl(schoolClassUrl) {
    document.querySelector('#addStudentForm > input[name="schoolClass"]').value = schoolClassUrl;
}

async function fetchApi() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const errorElement = document.querySelector("#error");
    const schoolClassUrl = urlSearchParams.get("schoolClass");

    try {
        saveUrl(schoolClassUrl);

        const [schoolClass, students] = await Promise.all([getClass(schoolClassUrl), getStudents(schoolClassUrl)]);
        updateSchoolClass(schoolClass);
        setupStudentTable(students);
    } catch (e) {
        errorElement.innerHTML = "This element probably does not exists or is not accessible";
        $(errorElement).slideDown().delay(3000).slideUp();
    }

}

const saveSportResultsButton = document.getElementById("saveSportResultsButton");
const post = document.getElementById('saveSportResultButton');
const remove = document.getElementById('confirmationDelete');
const finish = document.getElementById("confirmationFinish");
const addSportResultButton = document.getElementById("addSportResultButton");
const editStudentForm = document.querySelector("#editStudentForm");
const addStudentForm = document.querySelector("#addStudentForm");

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

post.addEventListener('click', function () {
    const editOrAddSportResult = editOrAdd();
    if (editOrAddSportResult) {
        editSportResult();
    } else {
        addSportResult();
    }
}, true);

remove.addEventListener('click', deleteStudentRequest, true);

addSportResultButton.addEventListener('click', function () {
    const sportResultButton = document.getElementById("saveSportResultButton");
    sportResultButton.hidden = !sportResultButton.hidden;
}, true);

finish.addEventListener('click', function () {

});

fetchApi();



