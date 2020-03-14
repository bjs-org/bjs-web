import {getClasses} from "./api.js";

function constructClassTableRow(schoolClass) {
    let row = document.createElement("tr");
    row.onclick = () => {
        window.location.href = `students_scores.html?schoolClass=${schoolClass._links.self.href}`;
    };

    if(schoolClass.grade === "7"){
        row.className = "table-success";
    }
    else if(schoolClass.grade === "8"){
        row.className = "table-warning";
    }
    else{
        row.className = "table-danger";
    }

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
    const classTableBody = document.querySelector("#class-tbody");
    const errorElement = document.querySelector("#error");

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
});