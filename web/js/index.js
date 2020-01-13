import {getClasses} from "./api.js";

function constructClassTableRow(schoolClass) {
    let row = document.createElement("tr");

    let grade = document.createElement("td");
    grade.innerText = schoolClass.grade;
    row.appendChild(grade);

    let className = document.createElement("td");
    className.innerText = schoolClass.className;
    row.appendChild(className);

    let classTeacher = document.createElement("td");
    classTeacher.innerText = schoolClass.classTeacherName === undefined ? "" : schoolClass.classTeacherName;
    row.appendChild(classTeacher);

    return row;
}


$(window).on("load", function () {
    const classesElement = document.querySelector("#classes");
    const errorElement = document.querySelector("#error");

    getClasses()
        .then(classes => {
            classes.forEach((schoolClass) => {
                let row = constructClassTableRow(schoolClass);
                classesElement.appendChild(row);
            });
        })
        .catch(err => {
            console.error(err);
            $(errorElement).slideDown("slow").delay(1500).slideUp("slow");
        })
});
