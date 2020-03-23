import {getAuth, getTopStudents} from "./api.js";

async function loadTopStudents(grade) {
    const topStudents = await getTopStudents(grade);
    const maleTopStudents = topStudents.male;
    const femaleTopStudents = topStudents.female;
    document.querySelector(`#li-${grade}-M-1`).innerText = maleTopStudents.first.firstName + " " + maleTopStudents.first.lastName;
    document.querySelector(`#li-${grade}-M-2`).innerText = maleTopStudents.second.firstName + " " + maleTopStudents.second.lastName;
    document.querySelector(`#li-${grade}-M-3`).innerText = maleTopStudents.third.firstName + " " + maleTopStudents.third.lastName;

    document.querySelector(`#li-${grade}-W-1`).innerText = femaleTopStudents.first.firstName + " " + femaleTopStudents.first.lastName;
    document.querySelector(`#li-${grade}-W-2`).innerText = femaleTopStudents.second.firstName + " " + femaleTopStudents.second.lastName;
    document.querySelector(`#li-${grade}-W-3`).innerText = femaleTopStudents.third.firstName + " " + femaleTopStudents.third.lastName;
}

async function loadPage() {
    const auth = await getAuth();
    if (auth.administrator === true) {
        document.querySelector("#navAdmin").hidden = false;
    }
    for (let i = 5; i <= 10; i++) {
        loadTopStudents(i);
    }
}

loadPage();