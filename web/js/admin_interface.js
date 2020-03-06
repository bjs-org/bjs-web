const passwordInput = document.querySelector("#passwordInput")
const userInput = document.querySelector("#userInput")
const isAdminInput = document.querySelector("#isAdminInput")
const confirmUserAdd = document.querySelector("#confirmUserAdd")
const showPassword = document.querySelector("#showPassword")

function addUser() {
    const data = {
        userName: userInput.value,
        password: passwordInput.value,
        administrator: isAdminInput.checked,
    };
    console.log(data);
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
