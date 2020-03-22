import { deleteUser, getAccessibleClasses, getClasses, getUsers, patchUser, postPrivilege, postUser, getAuth } from "./api.js"

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
const generatedUsersTableBody = document.querySelector("#generatedUsersTableBody")
const generatedUsersTable = document.querySelector("#generatedUsersTable")
const generatedUsersSpinner = document.querySelector("#generatedUsersSpinner")

let deleteUserUrl;

async function addUser() {
    if (userInput.value.trim().length !== 0) {
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

    const [users, classes, auth] = await Promise.all([
        getUsers(),
        getClasses(),
        getAuth()
    ]);

    console.log(auth);

    const userElements = users.map((user) => {
        const userUrl = user._links.self.href;

        if (auth.username === user.username) {
            console.log(auth.username);
        }

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
        adminInput.disabled = auth.username === user.username;
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

        const enabledInput = enabled.querySelector("input");
        enabledInput.disabled = auth.username === user.username;
        enabledInput.checked = user.enabled;
        enabledInput.addEventListener("change", async (e) => {
            const response = await patchUser(userUrl, {
                enabled: enabledInput.checked,
            })
        })
        tr.appendChild(enabled);


        const { accessibleClasses } = user;
        const classesElement = document.createElement("td");
        if (!user.administrator) {
            classesElement.innerHTML = `
            <select multiple data-live-search="true">
                ${classes.map(({ _links, grade, className }) =>
                `<option value="${_links.self.href}">${grade}${className}</option>`)}
            </select>
            `;
            const selectField = classesElement.querySelector("select")
            $(selectField).selectpicker("val", accessibleClasses.map(({ _links }) => _links.self.href.replace("{?projection}", "")));
            selectField.addEventListener("change", (e) => {
                // Differentiate between delete and create
                //sendPrivileges(userUrl, selectField.selectedOptions);
            });
        }

        tr.appendChild(classesElement);


        const deleteElement = document.createElement("td");
        deleteElement.innerHTML = `
        <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#deleteUser">
            <span>
                <i class="fas fa-trash-alt" aria-hidden="true"></i>
            </span>
        </button>
        `
        const deleteButton = deleteElement.querySelector("button")
        deleteButton.addEventListener("click", () => deleteUserUrl = userUrl)
        deleteButton.disabled = auth.username === user.username;
        tr.appendChild(deleteElement);

        return tr;
    });

    userTable.innerHTML = '';
    userElements.forEach(row => userTable.appendChild(row));
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

function groupBy(arr, prop) {
    return arr.reduce((sum, element) => {
        const propertyOfElement = prop(element);
        sum[propertyOfElement] = [...sum[propertyOfElement] || [], element];
        return sum;
    }, {})
}

confirmMultipleUsersAdd.addEventListener("click", async (e) => {
    let formData = new FormData(multipleUsersForm);

    multipleUsersForm.hidden = true;
    generatedUsersSpinner.hidden = false;

    const classOrGrade = formData.get("classGrade");
    const userCount = parseInt(formData.get("userCount"));

    const classes = await getClasses();

    console.log({
        userCount: userCount,
        classGrade: classOrGrade
    });

    if (classOrGrade === "class") {
        const createdUsers = [];
        for (let i = 0; i < userCount; i++) {
            createdUsers.push(... await Promise.all(
                classes.map(async (schoolClass) => {
                    const newUser = {
                        username: randomString(),
                        password: randomString(),
                    };
                    const userResponse = await postUser(newUser);

                    const newPrivilege = {
                        user: userResponse._links.self.href,
                        accessibleClass: schoolClass._links.self.href
                    };
                    const privilegeResponse = await postPrivilege(newPrivilege);

                    newUser["accessibleClass"] = schoolClass;

                    return newUser;
                })
            ))
        }
        createdUsers.forEach(user => {
            const row = document.createElement("tr");

            row.insertAdjacentHTML("beforeend", `<td>${user.username}</td>`);
            row.insertAdjacentHTML("beforeend", `<td>${user.password}</td>`);
            row.insertAdjacentHTML("beforeend", `<td>${user.accessibleClass.grade}${user.accessibleClass.className}</td>`);

            generatedUsersTableBody.appendChild(row);
        })
        console.log(createdUsers);
        console.table(createdUsers);
    } else {
        const classesByGrade = groupBy(classes, (schoolClass) => schoolClass.grade);
        console.log(classesByGrade);

        const createdUsers = [];

        for (let i = 0; i < userCount; i++) {
            createdUsers.push(... await Promise.all(
                Object.entries(classesByGrade).map(async ([grade, classes]) => {
                    console.log(`Stufe ${grade}`);
                    console.table(classes);

                    const newUser = {
                        username: randomString(),
                        password: randomString(),
                    };
                    const userResponse = await postUser(newUser);

                    await Promise.all(
                        classes.map(async (schoolClass) => {
                            const newPrivilege = {
                                user: userResponse._links.self.href,
                                accessibleClass: schoolClass._links.self.href
                            };
                            const privilegeResponse = await postPrivilege(newPrivilege);
                        })
                    );

                    newUser.accessibleClasses = classes;

                    return newUser;
                })
            ))
        }

        createdUsers.forEach(user => {
            const row = document.createElement("tr");

            row.insertAdjacentHTML("beforeend", `<td>${user.username}</td>`);
            row.insertAdjacentHTML("beforeend", `<td>${user.password}</td>`);
            row.insertAdjacentHTML("beforeend", `<td>${user.accessibleClasses.map(schoolClass => `${schoolClass.grade}${schoolClass.className}`)}</td>`);

            generatedUsersTableBody.appendChild(row);
        })

        console.log(createdUsers);
        console.table(createdUsers);

    }
    confirmMultipleUsersAdd.hidden = true;
    generatedUsersSpinner.hidden = true;
    generatedUsersTable.hidden = false;

    await updateUserTable();
});

$("#addMultipleUsers").on("hidden.bs.modal", () => {
    confirmMultipleUsersAdd.hidden = false;
    generatedUsersSpinner.hidden = true;
    generatedUsersTable.hidden = true;
    multipleUsersForm.hidden = false;
    multipleUsersForm.reset();
    generatedUsersTableBody.innerHTML = "";
})

updateUserTable()
    .then(() => addClassesToList());