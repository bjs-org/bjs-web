import { getAccessibleClasses, getClasses, getUsers, patchUser, postUser, postPrivilege, deleteUser } from "./api.js"

const passwordInput = document.querySelector("#passwordInput")
const userInput = document.querySelector("#userInput")
const isAdminInput = document.querySelector("#isAdminInput")
const confirmUserAdd = document.querySelector("#confirmUserAdd")
const showPassword = document.querySelector("#showPassword")
const selectClass = document.querySelector("#selectClass")
const userTable = document.querySelector("#userTable")
const selectClassGroup = document.querySelector("#selectClassGroup")
const confirmationDelete = document.querySelector("#confirmationDelete")
const multipleUsersForm = document.querySelector("#multipleUsersForm")
const confirmMultipleUsersAdd = document.querySelector("#confirmMultipleUsersAdd")

let deleteUserUrl;

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
        await sendPrivileges(user, selectClass.selectedOptions)
    } catch (e) {
        console.error(e);
    }

    await updateUserTable();
}

async function sendPrivileges(user, selectedOptions) {
    await Promise.all(
        Array.from(selectedOptions)
            .map(selectedClass => selectedClass.value)
            .map(async (accessibleClass) => {
                const privilege = {
                    user,
                    accessibleClass
                }
                const penis = await postPrivilege(privilege)
                console.log(penis)
            })
    )
}

async function addClassesToList() {
    const classes = await getClasses();
    console.log(classes);
    classes
        .map(({ grade, className, _links }) => `<option value="${_links.self.href}">${grade}${className}</option>`)
        .forEach((option) => selectClass.insertAdjacentHTML("beforeend", option));

    $(selectClass).selectpicker();
}

function randomString() {
    return Math.random().toString(36).substring(7);
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
            ${classes.map(({ _links, grade, className }) =>
            `<option value="${_links.self.href}">${grade}${className}</option>`)}
        </select>
        `;
        const selectField = classesElement.querySelector("select")
        $(selectField).selectpicker("val", accessibleClasses.map(({ _links }) => _links.self.href));
        selectField.addEventListener("change", (e) => {
            // Differentiate between delete and create
            //sendPrivileges(userUrl, selectField.selectedOptions);
        });

        tr.appendChild(classesElement);

        // HIER DELETE BUTTON
        const deleteElement = document.createElement("td");
        deleteElement.innerHTML = `
        <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#deleteUser">
            <span>
                <i class="fas fa-trash-alt" aria-hidden="true"></i>
            </span>
        </button>
        `
        deleteElement.querySelector("button").addEventListener("click", () => deleteUserUrl = userUrl)

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

confirmationDelete.addEventListener("click", async () => {
    if (deleteUserUrl) {
        await deleteUser(deleteUserUrl);
        deleteUserUrl = null;
        await updateUserTable();
    }
})

confirmMultipleUsersAdd.addEventListener("click", async (e) => {
    let formData = new FormData(multipleUsersForm);
    const classOrGrade = formData.get("classGrade")
    const userCount = formData.get("userCount")
    console.log({
        userCount: userCount,
        classGrade: classOrGrade
    })
    const classes = await getClasses();

    let createdUsers = [];

    if (classOrGrade === "class") {
        await classes.forEach(async schoolClass => {
            const newUser = {
                username: randomString(),
                password: randomString(),
            };
            const userResponse = await postUser(newUser);
            createdUsers.push(newUser);

            const newPrivilege = {
                user: userResponse._links.self.href,
                accessibleClass: schoolClass._links.self.href
            }
            const privilegeResponse = await postPrivilege(newPrivilege);
        })
    }

    console.log(createdUsers);
    console.table(createdUsers);
})

updateUserTable();
addClassesToList();