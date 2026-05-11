function mostrarMensagem(){

    alert("Bem-vindo ao Paul Games 🎮");

}

function validarFormulario(){

    let nome = document.getElementById("nome").value;
    let email = document.getElementById("email").value;

    if(nome === "" || email === ""){

        alert("Preencha todos os campos!");
        return false;

    }

    alert("Formulário enviado com sucesso!");
    return true;
}