import {getClasses, patchClosed} from "./api.js";


const modalClosed = $('#closedModal').modal({
    keyboard: false,
    show: false
});

let closeClassUrl;

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
    const {href: schoolClassUrl} = schoolClass._links.self;

    if (schoolClass.classClosed) {
        row.className = "table-dark";
        row.onclick = () => {
            closeClassUrl = schoolClassUrl;
            modalClosed.modal('show');
        };
    } else {
        row.onclick = () => {
            window.location.href = `students_of_class.html?schoolClass=${schoolClassUrl}`;
        }
    }

    const grade = document.createElement("td");
    grade.innerText = schoolClass.grade;
    row.appendChild(grade);

    const className = document.createElement("td");
    className.innerText = schoolClass.className.toUpperCase();
    row.appendChild(className);

    const classTeacher = document.createElement("td");
    classTeacher.innerText = schoolClass.classTeacherName || "";
    row.appendChild(classTeacher);

    return row;
}

const openAgain = document.querySelector("#confirmationOpen");
openAgain.addEventListener('click', async function () {
    if (closeClassUrl) {
        await patchClosed(closeClassUrl, {
            classClosed: false
        });
        closeClassUrl = null;
    }
    loadClasses();
});

loadClasses();
