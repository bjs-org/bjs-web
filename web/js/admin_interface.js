const passwordInput = document.querySelector("#passwordInput")
const userInput = document.querySelector("#userInput")
const isAdminInput = document.querySelector("#isAdminInput")
const confirmUserAdd = document.querySelector("#confirmUserAdd")

function addUser() {
    const data = {
        userName: userInput.value,
        password: passwordInput.value,
        administrator: isAdminInput.checked,
    };
    console.log(data);
}


$(window).on("load", function () {
    confirmUserAdd.addEventListener("click", addUser);
})