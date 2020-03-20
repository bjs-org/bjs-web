import { getAccessibleClasses, getClasses, getUsers, patchUser, postUser, postPrivilege } from "./api.js"

const passwordInput = document.querySelector("#passwordInput")
const userInput = document.querySelector("#userInput")
const isAdminInput = document.querySelector("#isAdminInput")
const confirmUserAdd = document.querySelector("#confirmUserAdd")
const showPassword = document.querySelector("#showPassword")
const selectClass = document.querySelector("#selectClass")
const userTable = document.querySelector("#userTable")
const selectClassGroup = document.querySelector("#selectClassGroup")

async function addUser() {
    const data = {
        username: userInput.value,
        password: passwordInput.value,
        administrator: isAdminInput.checked,
    };
    try {
        const json = await postUser(data);
        console.log(json);

        const user = json._links.self.href;
        await Promise.all(
            Array.from(selectClass.selectedOptions)
                .map(selectedClass => selectedClass.value)
                .map(async accessibleClass => {
                    const privilege = {
                        user,
                        accessibleClass
                    };
                    const penis = await postPrivilege(privilege);
                    console.log(penis);
                })
        );
    } catch (e) {
        console.error(e);
    }

    await updateUserTable();
}

async function addClassesToList() {
    const classes = await getClasses();
    console.log(classes);
    classes
        .map(({ grade, className, _links }) => `<option value="${_links.self.href}">${grade}${className}</option>`)
        .forEach((option) => selectClass.insertAdjacentHTML("beforeend", option));

    $(selectClass).selectpicker();
}

async function updateUserTable() {

    const [users, classes] = await Promise.all([getUsers(), getClasses()]);

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
        })
        tr.appendChild(enabled);


        const accessibleClasses = await getAccessibleClasses(user);
        const classesElement = document.createElement("td");
        classesElement.innerHTML = `
        <select multiple data-live-search="true">
            ${classes.map(({ grade, className }) =>
            `<option>${grade}${className}</option>
            `)}
        </select>
        `;
        $(classesElement.querySelector("select")).selectpicker("val", accessibleClasses.map(({ grade, className }) => `${grade}${className}`));
        tr.appendChild(classesElement);

        // HIER DELETE BUTTON
        const deleteElement = document.createElement("td");
        deleteElement.innerHTML = `
        <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#deleteUser">
        <span>
          <i class="fas fa-trash-alt" aria-hidden="true"></i>
        </span></button>
        `
        tr.appendChild(deleteElement);

        return tr;
    }));
    userTable.innerHTML = '';
    userElements.forEach(row => userTable.appendChild(row));
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

isAdminInput.addEventListener("change", (e) => {
    selectClassGroup.hidden = isAdminInput.checked;
})

updateUserTable();
addClassesToList();
