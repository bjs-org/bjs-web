import {removeClassFromUser, deleteUser, getAuth, getClasses, getUsers, patchUser, postPrivilege, postUser} from "./api.js"

const passwordInput = document.querySelector("#passwordInput");
const usernameInput = document.querySelector("#usernameInput");
const isAdminInput = document.querySelector("#isAdminInput");
const singleUserForm = document.querySelector("#userForm");
const showPassword = document.querySelector("#showPassword");
const selectClass = document.querySelector("#selectClass");
const userTable = document.querySelector("#userTable");
const selectClassGroup = document.querySelector("#selectClassGroup");
const confirmationDelete = document.querySelector("#confirmationDelete");
const multipleUsersForm = document.querySelector("#multipleUsersForm");
const confirmMultipleUsersAdd = document.querySelector("#confirmMultipleUsersAdd");
const generatedUsersTableBody = document.querySelector("#generatedUsersTableBody");
const generatedUsersTable = document.querySelector("#generatedUsersTable");
const generatedUsersSpinner = document.querySelector("#generatedUsersSpinner");
const sendingUserSpinner = document.querySelector("#sendingUserSpinner");

let deleteUserUrl;

async function sendPrivileges(user, classes) {
    await Promise.all(
        Array.from(classes)
            .map(async (accessibleClass) => {
                const privilege = {
                    user,
                    accessibleClass
                };
                const prviligeResponse = await postPrivilege(privilege);
                console.log(prviligeResponse)
            })
    )
}

function setupSelectPicker(selector) {
    $(selector).selectpicker();

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
        $(selector).selectpicker('mobile');
    }
}

async function addClassesToList() {
    const classes = await getClasses();
    console.log(classes);
    classes
        .map(({grade, className, _links}) => `<option value="${_links.self.href}">${grade}${className}</option>`)
        .forEach((option) => selectClass.insertAdjacentHTML("beforeend", option));

    setupSelectPicker(selectClass);

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

        const adminInput = admin.querySelector("input");
        adminInput.disabled = auth.username === user.username;
        adminInput.checked = user.administrator;
        adminInput.addEventListener("change", async (e) => {
            const response = await patchUser(userUrl, {
                administrator: adminInput.checked,
            });
        });
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


        const {accessibleClasses} = user;
        const classesElement = document.createElement("td");
        if (!user.administrator) {
            classesElement.innerHTML = `
            <select multiple data-live-search="true">
                ${classes.map(({_links, grade, className}) =>
                `<option value="${_links.self.href}">${grade}${className}</option>`)}
            </select>
            `;
            const selectField = classesElement.querySelector("select");
            $(selectField).selectpicker("val", accessibleClasses.map(({_links}) => _links.self.href.replace("{?projection}", "")));
            setupSelectPicker(selectField);

            Array.from(selectField.selectedOptions)
                .forEach(option => option.dataset.synced = '');


            selectField.addEventListener("change", async (e, data) => {


                Array.from(selectField.selectedOptions)
                    .filter(option => !option.dataset.hasOwnProperty("synced"))
                    .forEach((option) => {
                        option.disabled = true;
                        $(selectField).selectpicker("refresh");

                        option.dataset.synced = '';

                        postPrivilege({
                            accessibleClass: option.value,
                            user: userUrl
                        })
                            .then(r => console.log(r))
                            .then(() => {
                                option.disabled = false;
                                $(selectField).selectpicker("refresh");
                            });
                    });

                Array.from(selectField.options)
                    .filter(option => option.dataset.hasOwnProperty("synced"))
                    .filter(option => !option.selected)
                    .forEach(option => {
                        delete option.dataset.synced;
                        option.disabled = true;
                        $(selectField).selectpicker("refresh");

                        console.log(`DELETE ${option.value}`);
                        removeClassFromUser({
                            accessibleClass: option.value,
                            user: userUrl,
                        })
                            .then(() => {
                                option.disabled = false;
                                $(selectField).selectpicker("refresh");
                            });
                    });


                // Differentiate between delete and create
                //sendPrivileges(userUrl, selectField.selectedOptions);
            });
        }

        tr.appendChild(classesElement);


        const deleteElement = document.createElement("td");
        deleteElement.className = "text-right";
        deleteElement.innerHTML = `
        <button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#deleteUser">
            <span>
                <i class="fas fa-trash-alt" aria-hidden="true"></i>
            </span>
        </button>
        `;
        const deleteButton = deleteElement.querySelector("button");
        deleteButton.addEventListener("click", () => deleteUserUrl = userUrl);
        deleteButton.disabled = auth.username === user.username;
        tr.appendChild(deleteElement);

        return tr;
    });

    userTable.innerHTML = '';
    userElements.forEach(row => userTable.appendChild(row));
}

usernameInput.addEventListener("input", e => {
    if (usernameInput.value.trim().length === 0) {
        usernameInput.setCustomValidity("Please enter a valid username");
    } else {
        usernameInput.setCustomValidity("");
    }
});

singleUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (singleUserForm.checkValidity() === false) {
        e.stopPropagation();
    } else {
        let form = new FormData(singleUserForm);

        sendingUserSpinner.hidden = false;
        singleUserForm.hidden = true;

        try {
            let data = {
                username: form.get("username"),
                password: form.get("password"),
                administrator: form.get("administrator") != null,
            };

            const json = await postUser(data);
            console.log(json);

            if (!data.administrator) {
                const user = json._links.self.href;
                await sendPrivileges(user, form.getAll("classes"));
            }
        } catch (e) {
            console.error(e);
        }

        $("#addUser").modal("hide");
        await updateUserTable();
    }

    singleUserForm.classList.add('was-validated');

});

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
};

isAdminInput.addEventListener("change", (e) => {
    selectClassGroup.hidden = isAdminInput.checked;
});

confirmationDelete.addEventListener("click", async () => {
    if (deleteUserUrl) {
        await deleteUser(deleteUserUrl);
        deleteUserUrl = null;
        await updateUserTable();
    }
});

function groupBy(arr, prop) {
    return arr.reduce((sum, element) => {
        const propertyOfElement = prop(element);
        sum[propertyOfElement] = [...sum[propertyOfElement] || [], element];
        return sum;
    }, {})
}

multipleUsersForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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
            createdUsers.push(...await Promise.all(
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
        });
        console.log(createdUsers);
        console.table(createdUsers);
    } else {
        const classesByGrade = groupBy(classes, (schoolClass) => schoolClass.grade);
        console.log(classesByGrade);

        const createdUsers = [];

        for (let i = 0; i < userCount; i++) {
            createdUsers.push(...await Promise.all(
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
        });

        console.log(createdUsers);
        console.table(createdUsers);

    }
    confirmMultipleUsersAdd.hidden = true;
    generatedUsersSpinner.hidden = true;
    generatedUsersTable.hidden = false;

    await updateUserTable();
});

$("#addUser").on("hidden.bs.modal", () => {
    sendingUserSpinner.hidden = true;
    singleUserForm.hidden = false;
    singleUserForm.reset();
});

$("#addMultipleUsers").on("hidden.bs.modal", () => {
    confirmMultipleUsersAdd.hidden = false;
    generatedUsersSpinner.hidden = true;
    generatedUsersTable.hidden = true;
    multipleUsersForm.hidden = false;
    multipleUsersForm.reset();
    generatedUsersTableBody.innerHTML = "";
});

updateUserTable()
    .then(() => addClassesToList());