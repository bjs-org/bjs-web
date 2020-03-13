import { postUser, getClasses, getUsers } from "./api.js"

const passwordInput = document.querySelector("#passwordInput")
const userInput = document.querySelector("#userInput")
const isAdminInput = document.querySelector("#isAdminInput")
const confirmUserAdd = document.querySelector("#confirmUserAdd")
const showPassword = document.querySelector("#showPassword")
const classList = document.querySelector("#classList")
const userTable = document.querySelector("#userTable")

async function addUser() {
    const data = {
        username: userInput.value,
        password: passwordInput.value,
        administrator: isAdminInput.checked,
    };
    try {
        const json = await postUser(data);
        console.log(json);
    } catch (e) {
        console.log(e);
    }

}
async function addClassesToList() {
    const classes = await getClasses()
    classes.forEach((schoolClass) => {
        classList.appendChild(schoolClass);
    })
}

async function updateUserTable() {
    let users = await getUsers();

    users.map(user => {
        const tr = document.createElement("tr");
        const username = document.createElement("td");
        username.innerText = user.username;
        tr.appendChild(username);

        const admin = document.createElement("td");
        admin.innerHTML = `<div class="custom-control custom-switch">
        <input type="checkbox" class="custom-control-input" id="customSwitch${user.username}">
        <label class="custom-control-label" for="customSwitch${user.username}"></label>
      </div>`;

        admin.querySelector("input").checked = user.administrator;
        tr.appendChild(admin);

        return tr;
    }).forEach(row => {
        userTable.appendChild(row)
    })

    console.log(users);
}

confirmUserAdd.addEventListener("click", addUser);
showPassword.onclick = () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        const icon = showPassword.querySelector("a > i");
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        passwordInput.type = "password";
        const icon = showPassword.querySelector("a > i");
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

addClassesToList();
updateUserTable();
