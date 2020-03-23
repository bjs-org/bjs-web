import {getClass, getStudents} from "./api.js";
import {getAuth} from "./api";

async function fetchApi() {
    const auth = await getAuth();
    if(auth.administrator === true){
        document.querySelector("#navAdmin").hidden = false;
    }
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

function setupStudentTable(students) {
    const studentsTableBody = document.querySelector("#students-tbody");
    studentsTableBody.querySelectorAll("tr")
        .forEach(row => studentsTableBody.removeChild(row));
    students.forEach((student) => {
        let row = constructStudentTableRow(student);
        studentsTableBody.appendChild(row);
    });
}

function updateSchoolClass(schoolClass) {
    const className = document.querySelector("#class-name");
    className.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const websiteTitle = document.querySelector("#title");
    websiteTitle.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classBreadCrumb = document.querySelector("#breadCrumb");
    classBreadCrumb.innerHTML = `${schoolClass.grade}${schoolClass.className}`;

    const classTeacher = document.querySelector("#class-teacher");
    classTeacher.innerHTML = schoolClass.classTeacherName ?? '';
}

function constructStudentTableRow(student) {
    let row = document.createElement("tr");

    let firstName = document.createElement("td");
    firstName.innerText = student.firstName;
    row.appendChild(firstName);

    let lastName = document.createElement("td");
    lastName.innerText = student.lastName;
    row.appendChild(lastName);

    let gender = document.createElement("td");
    gender.innerText = student.female ? "Weiblich" : "Männlich";
    row.appendChild(gender);

    let certificate = document.createElement("td");
    certificate.innerText = renameClassification(student.classification);
    row.appendChild(certificate);

    let points = document.createElement("td");
    points.innerText = student.score;
    row.appendChild(points);

    let done = document.createElement("td");
    let divCheckBox = document.createElement("div");
    divCheckBox.className = "custom-control custom-checkbox";
    let doneCheckBox = document.createElement("input");
    doneCheckBox.type = "checkbox";
    doneCheckBox.className = "custom-control-input";
    $(doneCheckBox).prop('indeterminate', true);
    divCheckBox.appendChild(doneCheckBox);
    done.appendChild(divCheckBox);
    row.appendChild(done);

    return row;
}

function renameClassification(classification) {
    if(classification === "PARTICIPANT"){
        return "Teilnehmer";
    } else  if(classification === "HONOR"){
        return "Ehrenurkunde";
    } else{
        return "Siegesurkunde";
    }
}

fetchApi();