import {getAccessibleClasses, getClasses, getUsers, patchUser, postUser} from "./api.js"

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

// async function addClassesToList() {
//     const classes = await getClasses()
//     classes.forEach((schoolClass) => {
//         classList.appendChild(schoolClass);
//     })
// }

async function updateUserTable() {
    let users = await getUsers();
    const classes = await getClasses();

    const userElements = await Promise.all(users.map(async (user) => {
        const userUrl = user._links.self.href;

        const tr = document.createElement("tr");
        const username = document.createElement("td");
        username.innerText = user.username;
        tr.appendChild(username);

        const admin = document.createElement("td");
        admin.innerHTML = `
        <div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" id="adminSwitch${user.username}">
            <label class="custom-control-label" for="adminSwitch${user.username}"></label>
        </div>`;

        const adminInput = admin.querySelector("input")
        adminInput.checked = user.administrator;
        adminInput.addEventListener("change", async (e) => {
            const response = await patchUser(userUrl, {
                administrator: adminInput.checked,
            });
            console.log(response);
        })
        tr.appendChild(admin);

        const enabled = document.createElement("td");
        enabled.innerHTML = `
        <div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" id="enabledSwitch${user.username}">
            <label class="custom-control-label" for="enabledSwitch${user.username}"></label>
        </div>`;

        const enabledInput = enabled.querySelector("input")
        enabledInput.checked = user.enabled;
        enabledInput.addEventListener("change", async (e) => {
            const response = await patchUser(userUrl, {
                enabled: enabledInput.checked,
            })
            console.log(response);
        })
        tr.appendChild(enabled);

        const accessibleClasses = await getAccessibleClasses(user);
        const classesElement = document.createElement("td");
        classesElement.innerHTML = `
        <select class="schoolClassPicker" multiple data-live-search="true">
            ${classes.map(schoolClass =>
            `<option>${(schoolClass.grade)}${(schoolClass.className)}</option>
            `)}
        </select>
        `;

        tr.appendChild(classesElement);

        return tr;
    }));

    userElements.forEach(row => userTable.appendChild(row));

    $(".schoolClassPicker").selectpicker();


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

updateUserTable();
