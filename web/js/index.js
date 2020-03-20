import {getClasses,
        patchClosed} from "./api.js";


const modalClosed = $('#closedModal').modal({
    keyboard: false,
    show: false
});

let classURL = "";

async function loadClasses() {
    const classTableBody = document.querySelector("#class-tbody");
    const errorElement = document.querySelector("#error");
    classTableBody.querySelectorAll("tr")
        .forEach(row => classTableBody.removeChild(row));
    getClasses()
        .then(classes => {
            classes.sort();
            classes.forEach((schoolClass) => {
                let row = constructClassTableRow(schoolClass);
                classTableBody.appendChild(row);
            });
        })
        .catch(err => {
            console.error(err);
            $(errorElement).slideDown("slow").delay(1500).slideUp("slow");
        })
}

function constructClassTableRow(schoolClass) {
    let row = document.createElement("tr");
    if(schoolClass.classClosed === true){
        row.className = "table-dark";
    }
        row.onclick = () => {
            if(schoolClass.classClosed === true){
                classURL = schoolClass._links.self.href;
                modalClosed.modal('show');
            } else {
                window.location.href = `students_of_class.html?schoolClass=${schoolClass._links.self.href}`;
            }
    };

    let grade = document.createElement("td");
    grade.innerText = schoolClass.grade;
    row.appendChild(grade);

    let className = document.createElement("td");
    className.innerText = schoolClass.className.toUpperCase();
    row.appendChild(className);

    let classTeacher = document.createElement("td");
    classTeacher.innerText = schoolClass.classTeacherName === undefined ? "" : schoolClass.classTeacherName;
    row.appendChild(classTeacher);

    return row;
}
const openAgain = document.querySelector("#confirmationOpen");
openAgain.addEventListener('click', async function () {
    const data = {
        classClosed: false
    };
    await patchClosed(classURL, data);
    loadClasses();
});

loadClasses();
