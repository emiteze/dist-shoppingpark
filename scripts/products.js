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

function popularTabelas(funcao){
    var tabela;
    var linha, col1, col2, col3, col4, col5, col6, col7;
    var i = 0;

    tabela = document.getElementById("prodTable");

    firebase.database().ref("/product").orderByChild("type").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            linha = tabela.insertRow(++i);
            col1 = linha.insertCell(0);
            col2 = linha.insertCell(1);
            col3 = linha.insertCell(2);
            col4 = linha.insertCell(3);
            col5 = linha.insertCell(4);
            linha.insertCell(5);
            col1.innerHTML = childSnapshot.val().name;
            col2.innerHTML = childSnapshot.val().type;
            col3.innerHTML = childSnapshot.val().manufacturer;
            if(childSnapshot.val().isPerishable == 'S')
                col4.innerHTML = childSnapshot.val().expirationAlert + ' dias';
            else
                col4.innerHTML = 'Não perecível';
            col5.innerHTML = childSnapshot.val().minimumStock;
            if(funcao == '1')
            {
                col6 = linha.insertCell(6);
                col7 = linha.insertCell(7);
                col6.innerHTML = '<img src="../../img/edit.png" style="width:100%; padding-top:3px; cursor:pointer; display:block; margin:auto" title="Editar" onclick="editarProduto(\'' + childSnapshot.key + '\')" />';
                col7.innerHTML = '<img src="../../img/remove.png" style="width:100%; padding-top:3px; cursor:pointer; display:block; margin:auto" title="Remover" onclick="removerProduto(\'' + childSnapshot.key + '\')" />';
            }
        });
    });
}

function deslogar() {
    firebase.auth().signOut().then(function() {
        window.location.href = '../../index.html';
    }, function(error) {
        alert("Erro!" + error);
    });
}

function abrirAddModal(){
    var modal = document.getElementById('addModal');

    modal.style.display = "block";
}

function fecharAddModal(){
    var modal = document.getElementById('addModal');
    var txtNome = document.getElementById('txtNomeAddModal');
    var txtTipo = document.getElementById('txtTipoAddModal');
    var txtMarca = document.getElementById('txtMarcaAddModal');
    var txtValidade = document.getElementById('txtValidadeAddModal');
    var txtMinimo = document.getElementById('txtMinimoAddModal');

    txtNome.value = "";
    txtTipo.options[txtTipo.selectedIndex].value = '0';
    txtMarca.value = "";
    txtValidade.value = "";
    txtMinimo.value = "";
    modal.style.display = "none";
}

function adicionarProduto(){
    var txtNome = document.getElementById('txtNomeAddModal').value;
    var txtTipo = document.getElementById('txtTipoAddModal');
    var txtMarca = document.getElementById('txtMarcaAddModal').value;
    var txtValidade = document.getElementById('txtValidadeAddModal').value;
    var txtMinimo = document.getElementById('txtMinimoAddModal').value;


    if(txtNome == '' || txtTipo.options[txtTipo.selectedIndex].value == '0' || txtMarca == '' || txtMinimo == '') {
        alert("O nome, tipo, marca e quantidade mínima são obrigatórios!");
    } else {
        if(txtValidade != '') {
            firebase.database().ref().child('product').push().set({
                name: txtNome,
                type: txtTipo.options[txtTipo.selectedIndex].text,
                manufacturer: txtMarca,
                expirationAlert: parseInt(txtValidade),
                minimumStock: parseInt(txtMinimo),
                isPerishable: 'S',
                amountInStock: parseInt("0")
            });
        } else {
            firebase.database().ref().child('product').push().set({
                name: txtNome,
                type: txtTipo.options[txtTipo.selectedIndex].text,
                manufacturer: txtMarca,
                minimumStock: parseInt(txtMinimo),
                isPerishable: 'N',
                amountInStock: parseInt("0")
            });
        }
        alert("Produto cadastrado com sucesso!");
        fecharAddModal();
        location.reload();
    }
}

function abrirEditModal(){
    var modal = document.getElementById('editModal');

    modal.style.display = "block";
}

function fecharEditModal(){
    var modal = document.getElementById('editModal');
    var txtNome = document.getElementById('txtNomeEditModal');
    var txtTipo = document.getElementById('txtTipoEditModal');
    var txtMarca = document.getElementById('txtMarcaEditModal');
    var txtValidade = document.getElementById('txtValidadeEditModal');
    var txtMinimo = document.getElementById('txtMinimoEditModal');

    txtNome.value = "";
    txtTipo.options[txtTipo.selectedIndex].value = '0'
    txtMarca.value = "";
    txtValidade.value = "";
    txtMinimo.value = "";
    modal.style.display = "none";
}

function editarProduto(id){
    abrirEditModal();
    var txtId = document.getElementById('idLabelEditModal');
    var txtNome = document.getElementById('txtNomeEditModal');
    var txtTipo = document.getElementById('txtTipoEditModal');
    var txtMarca = document.getElementById('txtMarcaEditModal');
    var txtValidade = document.getElementById('txtValidadeEditModal');
    var txtMinimo = document.getElementById('txtMinimoEditModal');

    firebase.database().ref("/product").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if(childSnapshot.key == id)
            {
                txtId.value = childSnapshot.key;
                txtNome.value = childSnapshot.val().name;
                if(childSnapshot.val().type == 'Alimento')
                    txtTipo.selectedIndex = 1;
                else if(childSnapshot.val().type == 'Construção')
                    txtTipo.selectedIndex = 2;
                else if(childSnapshot.val().type == 'Eletrônico')
                    txtTipo.selectedIndex = 3;
                else if(childSnapshot.val().type == 'Higiene')
                    txtTipo.selectedIndex = 4;
                else if(childSnapshot.val().type == 'Lazer')
                    txtTipo.selectedIndex = 5;
                else if(childSnapshot.val().type == 'Limpeza')
                    txtTipo.selectedIndex = 6;
                else if(childSnapshot.val().type == 'Móveis')
                    txtTipo.selectedIndex = 7;
                else if(childSnapshot.val().type == 'Música')
                    txtTipo.selectedIndex = 8;
                else if(childSnapshot.val().type == 'Vestuário')
                    txtTipo.selectedIndex = 9;

                txtMarca.value = childSnapshot.val().manufacturer;
                txtMinimo.value = childSnapshot.val().minimumStock;
                if(childSnapshot.val().isPerishable == 'S')
                    txtValidade.value = childSnapshot.val().expirationAlert;
            }
        });
    });
}

function confirmarEdicao(){
    var txtId = document.getElementById('idLabelEditModal').value;
    var txtNome = document.getElementById('txtNomeEditModal').value;
    var txtTipo = document.getElementById('txtTipoEditModal');
    var txtMarca = document.getElementById('txtMarcaEditModal').value;
    var txtValidade = document.getElementById('txtValidadeEditModal').value;
    var txtMinimo = document.getElementById('txtMinimoEditModal').value;

    if(txtNome != '' && txtTipo.options[txtTipo.selectedIndex].value != '0' && txtMarca != '' && txtMinimo != '')
    {
        var ref = firebase.database().ref("/product/" + txtId);
        ref.child('name').set(txtNome);
        ref.child('type').set(txtTipo.options[txtTipo.selectedIndex].text);
        ref.child('manufacturer').set(txtMarca);
        ref.child('minimumStock').set(parseInt(txtMinimo));

        if(txtValidade == '')
        {
            ref.child('isPerishable').set('N');
            ref.child('expirationAlert').set(0);
        }
        else
        {
            ref.child('isPerishable').set('S');
            ref.child('expirationAlert').set(parseInt(txtValidade));
        }
        alert("Edição concluida com sucesso");
        fecharEditModal();
        location.reload();
    }
    else
    {
        alert("O nome, o tipo, a marca e a quantidade mínima são obrigatórios!");
    }
}

function removerProduto(id){
  var productQtd;
  if (confirm("Você tem certeza que deseja deletar esse produto?") == true){
    firebase.database().ref("/product").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if(childSnapshot.key == id){
              productQtd = childSnapshot.amountInStock;
            }
        });
        if(productQtd <= 0){
          firebase.database().ref("/product/" + id).remove().then(function(){
              alert("Remoção efetuada com sucesso!");
              location.reload();
          }).catch(function(error) {
              alert("A remoção falhou: " + error.message)
          });
        } else{
          alert("O produto não pode ser deletado pois ainda existem produtos no estoque");
        }
    });
  }
}

function verificaExisteBaseRelatorio(){
	var dateAtual = new Date();
	var dia = (dateAtual.getDate() < 10) ? '0' + dateAtual.getDate() : dateAtual.getDate();
	var mes = (dateAtual.getMonth() + 1 < 10) ? '0' + (dateAtual.getMonth() +1) : dateAtual.getMonth() + 1;
	var ano = dateAtual.getFullYear();
	var dataFull = "" + ano + "" + mes + "" + dia;
	var listProdutosToSave = "";
	var flag = true;
	firebase.database().ref("/productDateHistoric").orderByChild("type").on("value", function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			if(childSnapshot.val().date.toString().localeCompare(dataFull) == 0){
				flag = false;
			}
		});
		if(flag){
			listProdutosToSave += "" + dia + "/" + mes + "/" + ano;
			listProdutosToSave += "\n\n";
			firebase.database().ref("/product").orderByChild("type").on("value",function(snapshot){
				snapshot.forEach(function(childSnapshot1){
					listProdutosToSave += childSnapshot1.val().name + " - " + childSnapshot1.val().amountInStock + "\n";
				});
				firebase.database().ref().child('productDateHistoric').push().set({
					date: parseInt(dataFull),
					textReport: listProdutosToSave
				});
			});
		}
	});
}
