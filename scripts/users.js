function verificarAutenticidade(funcao) {
    firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        firebase.database().ref("/user").orderByChild("mail").equalTo(user.email).on("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                if(childSnapshot.val().permissionType != funcao)
                {
                    deslogar();
                }
            });
        });
    } else {
        deslogar();
    }
    });
}

function deslogar() {
    firebase.auth().signOut().then(function() {
        window.location.href = '../../login.html';
    }, function(error) {
        alert("Erro!" + error);
    });
}

function popularTabelaUsers(){
    var tabela;
    var linha, col1, col2, col3, col4, col5, col6, col7;
    var i = 0;

    tabela = document.getElementById("userTable");

    firebase.database().ref("/user").orderByChild("type").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            linha = tabela.insertRow(++i);
            col1 = linha.insertCell(0);
            col2 = linha.insertCell(1);
            col3 = linha.insertCell(2);
            col4 = linha.insertCell(3);
            linha.insertCell(4);
            col5 = linha.insertCell(5);
            col6 = linha.insertCell(6);
            col7 = linha.insertCell(7);
            col1.innerHTML = childSnapshot.val().name;
            col2.innerHTML = childSnapshot.val().mail;
            if(childSnapshot.val().permissionType == 0){
              col3.innerHTML = "Estagiário";
            } else if(childSnapshot.val().permissionType == 1){
              col3.innerHTML = "Administrador";
            } else{
              col3.innerHTML = "Usuário bloqueado";
            }
            col4.innerHTML = childSnapshot.val().phone;
            col5.innerHTML = '<img src="../../img/edit.png" style="width:100%; padding-top:3px; cursor:pointer; display:block; margin:auto" title="Editar" onclick="editarUsuario(\'' + childSnapshot.key + '\')" />';
            if(childSnapshot.val().permissionType != 2)
                col7.innerHTML = '<img src="../../img/block.png" style="width:100%; padding-top:3px; cursor:pointer; display:block; margin:auto" title="Bloquear" onclick="bloquearUsuario(\'' + childSnapshot.key + '\')" />';
            else
                col6.innerHTML = '<img src="../../img/unblock.png" style="width:100%; padding-top:3px; cursor:pointer; display:block; margin:auto" title="Desbloquear" onclick="desbloquearUsuario(\'' + childSnapshot.key + '\')" />';
        });
    });
}

function bloquearUsuario(id)
{
    if (confirm("Você tem certeza que deseja bloquear esse usuário?") == true)
    {
        var ref = firebase.database().ref("/user/" + id);
        ref.child('permissionType').set('2');

        alert("O usuário foi bloqueado com sucesso!");
        location.reload();
    }
}

function desbloquearUsuario(id)
{
    if (confirm("Você tem certeza que deseja desbloquear esse usuário?") == true)
    {
        firebase.database().ref("/user").on("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                if(childSnapshot.key == id)
                {
                    var ref = firebase.database().ref("/user/" + id);
                    if(childSnapshot.val().role == 'Administrador')
                        ref.child('permissionType').set(1);
                    else if(childSnapshot.val().role == 'Estagiário')
                        ref.child('permissionType').set(0);
                    alert("Usuário desbloqueado com sucesso!");
                    location.reload();
                }
            });
        });
    }
}

function abrirAddUserModal(){
    var modal = document.getElementById('addUserModal');

    modal.style.display = "block";
}

function fecharAddUserModal(){
    var modal = document.getElementById('addUserModal');
    var txtNome = document.getElementById('txtNameAddUserModal');
    var txtEmail = document.getElementById('txtEmailAddUserModal');
    var txtTel = document.getElementById('txtTelAddUserModal');
    var txtSenha = document.getElementById('txtPassAddUserModal');
    var txtSenha2 = document.getElementById('txtPass2AddUserModal');
    var categoria = document.getElementById('txtCatAddUserModal');

    txtNome.value = "";
    txtEmail.value = "";
    txtTel.value = "";
    txtSenha.value = "";
    txtSenha2.value = "";
    categoria.selectedIndex = 0;
    modal.style.display = "none";
}

function adicionarUsuario(){
  var txtNome = document.getElementById('txtNameAddUserModal').value;
  var txtEmail = document.getElementById('txtEmailAddUserModal').value;
  var txtTel = document.getElementById('txtTelAddUserModal').value;
  var txtSenha = document.getElementById('txtPassAddUserModal').value;
  var txtSenha2 = document.getElementById('txtPass2AddUserModal').value;
  var categoria = document.getElementById('txtCatAddUserModal');

  var permission;

  if(txtNome == '' || txtEmail == '' || txtTel == '' || txtSenha == '' || txtSenha2 == '' || categoria.options[categoria.selectedIndex].value == '0'){
    alert("Todos os campos devem ser preenchidos!");
  }
  else if(txtSenha != txtSenha2){
    alert("As senhas devem ser iguais!");
  } else{
    if(categoria.options[categoria.selectedIndex].text == 'Administrador')
        permission = 1;
    else if(categoria.options[categoria.selectedIndex].text == 'Estagiário')
        permission = 0;

    firebase.auth().createUserWithEmailAndPassword(txtEmail, txtSenha).then(function(firebaseUser){
      firebase.database().ref().child('user').push().set({
          mail: txtEmail,
          name: txtNome,
          permissionType: parseInt(permission),
          role: categoria.options[categoria.selectedIndex].text,
          phone: txtTel
      });
      fecharAddUserModal();
      alert("Usuário criado com sucesso!");
      location.reload();
    }).catch(function(error){
      var errorCode = error.code;
      console.log(errorCode);
      if(errorCode === 'auth/email-already-in-use'){
        alert("O email já está cadastrado!");
      } else if(errorCode === 'auth/weak-password'){
        alert("A senha está muito fraca!");
      } else if(errorCode === 'auth/invalid-email'){
        alert("Este email não existe!");
      }
    });
  }
}

function abrirEditModal(){
  var modal = document.getElementById('editModal');
  modal.style.display = "block";
}

function fecharEditModal(){
  var modal = document.getElementById('editModal');
  var txtNome = document.getElementById('txtNameEditUserModal');
  var txtEmail = document.getElementById('txtEmailEditUserModal');
  var txtTel = document.getElementById('txtTelEditUserModal');
  var txtCategoria = document.getElementById('txtCatEditUserModal');

  txtNome.value = "";
  txtEmail.value = "";
  txtTel.value = "";
  txtCategoria.options[txtCategoria.selectedIndex].value = '0';
  modal.style.display = "none";
}

//selectedIndex == 1 : permissionType == 1
//selectedIndex == 2 : permissionType == 0

function editarUsuario(id){
  abrirEditModal();
  var txtId = document.getElementById('idLabelEditModal');
  var txtNome = document.getElementById('txtNameEditUserModal');
  var txtEmail = document.getElementById('txtEmailEditUserModal');
  var txtTel = document.getElementById('txtTelEditUserModal');
  var txtCategoria = document.getElementById('txtCatEditUserModal');

  firebase.database().ref("/user").on("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      if(childSnapshot.key == id){
        txtId.value = childSnapshot.key;
        txtNome.value = childSnapshot.val().name;
        txtEmail.value = childSnapshot.val().mail;
        txtTel.value = childSnapshot.val().phone;
        if(childSnapshot.val().permissionType == 0) txtCategoria.selectedIndex = 2;
        else if(childSnapshot.val().permissionType == 1) txtCategoria.selectedIndex = 1;
      }
    });
  });
}

function confirmarEdicao(){
  var txtId = document.getElementById('idLabelEditModal').value;
  var txtNome = document.getElementById('txtNameEditUserModal').value;
  var txtTel = document.getElementById('txtTelEditUserModal').value;
  var txtCategoria = document.getElementById('txtCatEditUserModal');

  if(txtNome != '' && txtTel != '' && txtCategoria.options["selectedIndex"] != '0'){
    var ref = firebase.database().ref("/user/" + txtId);
    ref.child('name').set(txtNome);
    ref.child('phone').set(txtTel);

    if(txtCategoria.options["selectedIndex"] == 1){
      ref.child('permissionType').set(1);
    } else if(txtCategoria.options["selectedIndex"] == 2){
      ref.child('permissionType').set(0);
    }
    alert("Edição concluida com sucesso");
    fecharEditModal();
    location.reload();
  } else {
      alert("O nome, o telefone são obrigatórios e a categoria de usuário!");
  }
}
