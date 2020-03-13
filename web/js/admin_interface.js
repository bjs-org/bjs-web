import {postUser, getClasses} from "./api.js"

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
    } catch(e){
        console.log(e);
    }

}
async function addClassesToList() {
   const classes =  await getClasses()
   classes.forEach((schoolClass) => {
       classList.appendChild(schoolClass);
   }) 
}

confirmUserAdd.addEventListener("click", addUser);
showPassword.onclick = () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        const icon = showPassword.querySelector("a > i");
        icon.classList.replace("fa-eye","fa-eye-slash");
    } else {
        passwordInput.type = "password";
        const icon = showPassword.querySelector("a > i");
        icon.classList.replace("fa-eye-slash","fa-eye");
    }
}

addClassesToList()
function updateUserTable() {
    
}