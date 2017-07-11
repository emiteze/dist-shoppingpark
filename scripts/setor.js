function popularTabelaSetores(){
    var tabela;
    var linha, col1, col2, col3, col4;
    var i = 0;

    tabela = document.getElementById("sectorTable");

    firebase.database().ref("/sector").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            linha = tabela.insertRow(++i);
            col1 = linha.insertCell(0);
            col2 = linha.insertCell(1);
            linha.insertCell(2);
            col3 = linha.insertCell(3);
            col4 = linha.insertCell(4);
            col1.innerHTML = childSnapshot.val().name;
            col2.innerHTML = childSnapshot.val().owner;
            col3.innerHTML = '<img src="../../img/edit.png" style="width:100%; padding-top:3px; cursor:pointer; display:block; margin:auto" title="Editar" onclick="editarSetor(\'' + childSnapshot.key + '\')" />';;
            col4.innerHTML = '<img src="../../img/remove.png" style="width:100%; padding-top:3px; cursor:pointer; display:block; margin:auto" title="Remover" onclick="removerSetor(\'' + childSnapshot.key + '\')" />';
        });
    });
}

function adicionarSetor(){
    var txtNome = document.getElementById('txtNomeAddSectorModal').value;
    var txtProp = document.getElementById('txtPropAddSectorModal').value;

    if(txtNome == '' || txtProp == '')
    {
        alert("O nome e o proprietário são obrigatórios!");
    }
    else
    {
        firebase.database().ref().child('sector').push().set({
            name: txtNome,
            owner: txtProp
        });
        fecharAddSectorModal();
        location.reload();
    }
}

function fecharAddSectorModal(){
    var modal = document.getElementById('addModal');
    var txtNome = document.getElementById('txtNomeAddSectorModal');
    var txtProp = document.getElementById('txtPropAddSectorModal');

    txtNome.value = "";
    txtProp.value = "";

    modal.style.display = "none";
}

function editarSetor(id){
    var modal = document.getElementById('editModal');

    modal.style.display = "block";

    var txtId = document.getElementById('idLabelEditModal');
    var txtNome = document.getElementById('txtNomeEditSectorModal');
    var txtProp = document.getElementById('txtPropEditSectorModal');

    firebase.database().ref("/sector").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if(childSnapshot.key == id)
            {
                txtId.value = childSnapshot.key;
                txtNome.value = childSnapshot.val().name;
                txtProp.value = childSnapshot.val().owner;
            }
        });
    });
}

function confirmarEdicaoSetor(){
    var txtId = document.getElementById('idLabelEditModal').value;
    var txtNome = document.getElementById('txtNomeEditSectorModal').value;
    var txtProp = document.getElementById('txtPropEditSectorModal').value;

    if(txtNome != '' && txtProp != '')
    {
        var ref = firebase.database().ref("/sector/" + txtId);
        ref.child('name').set(txtNome);
        ref.child('owner').set(txtProp);

        fecharEditSectorModal();
        location.reload();
    }
    else
    {
        alert("Todos os campos são obrigatórios!");
    }
}

function fecharEditSectorModal(){
    var modal = document.getElementById('editModal');
    var txtNome = document.getElementById('txtNomeEditSectorModal').value;
    var txtProp = document.getElementById('txtPropEditSectorModal').value;

    txtNome.value = "";
    txtProp.value = "";

    modal.style.display = "none";
}

function removerSetor(id){
    if (confirm("Você tem certeza que deseja deletar esse setor?") == true)
    {
        firebase.database().ref("/sector/" + id).remove()
        .then(function(){
            alert("Remoção efetuada com sucesso!");
            location.reload();
        }).catch(function(error) {
            alert("A remoção falhou: " + error.message)
        });
    }
}
