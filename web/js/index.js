import {getClasses, patchClosed, addClass, editClass, getAuth} from "./api.js";


const modalClosed = $('#closedModal').modal({
    keyboard: false,
    show: false
});

const modalAdd = $('#addClassModal').modal({
    keyboard: true,
    show: false
});

let classUrl = null;
let auth = false;

async function loadClasses() {
    const admin = await getAuth();
    if(admin.administrator === true){
        auth = true;
        document.querySelector("#addButton").hidden = false;
        document.querySelector("#navAdmin").hidden = false;
    }
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
            classUrl = schoolClassUrl;
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

    let edit = document.createElement("td");
    if(auth === true){
        edit.hidden = false;
    }
    else{
        edit.hidden = true;
    }
    edit.className = "editButtons";
    let buttonEdit = document.createElement("span");
    buttonEdit.onclick = (event) => {
        event.stopPropagation();
        openAsEdit(schoolClass);
    };
    buttonEdit.title = "Verändere diese Klasse.";
    let iconEdit = document.createElement("i");
    iconEdit.className = "fas fa-user-edit";
    buttonEdit.appendChild(iconEdit);
    edit.appendChild(buttonEdit);
    row.appendChild(edit);

    return row;
}

function openAsEdit(schoolClass) {
    const editModal = document.querySelector("#addClassModal");
    document.querySelector("#addModalTitle").innerText = "Editieren sie diese Klasse.";
    editModal.querySelector("#addGrade").value = schoolClass.grade;
    document.querySelector("#addName").value = schoolClass.className;
    document.querySelector("#addTeacherName").value = schoolClass.classTeacherName;
    classUrl = schoolClass._links.self.href;
    modalAdd.modal('show');
}

async function addSchoolClass(formData) {
    const errorElement = document.querySelector("#error").value;
    modalAdd.modal('hide');
    const data = {
        grade: formData.get("grade"),
        className: formData.get("addName"),
        classTeacherName: formData.get("addTeacherName"),
        classClosed: false
    };
    await addClass(data)
        .catch(() => {
            errorElement.innerHTML = "The post request was not successful.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    loadClasses();
}

async function editSchoolClass(formData) {
    const errorElement = document.querySelector("#error").value;
    modalAdd.modal('hide');
    const data = {
        grade: formData.get("grade"),
        className: formData.get("addName"),
        classTeacherName: formData.get("addTeacherName"),
    };
    await editClass(data, classUrl)
        .catch(() => {
            errorElement.innerHTML = "Das Aktualisieren der Klasse war nicht erfolgreich.";
            $(errorElement).slideDown().delay(3000).slideUp();
        });
    document.querySelector("#addModalTitle").innerText = "Klasse hinzufügen?";
    classUrl = null;
    loadClasses();
}

const openAgain = document.querySelector("#confirmationOpen");
openAgain.addEventListener('click', async function () {
    if (closeClassUrl) {
        await patchClosed(closeClassUrl, {
            classClosed: false
        });
        classUrl = null;
    }
    loadClasses();
});

const addOrEditSchoolClassForm = document.querySelector("#addClassForm");
addOrEditSchoolClassForm.addEventListener("submit", (event) =>  {
    event.preventDefault();
    const data = new FormData(event.target);
    console.log(classUrl);
    if(classUrl === null){
        addSchoolClass(data);
    }
    else{
        editSchoolClass(data, classUrl);
    }
});

loadClasses();
