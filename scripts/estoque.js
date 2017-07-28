var arrayProdutos = {};
var arraySetores = {};
var arrayQuantidadeProdutos = {};
var arrayQuantidadeEstoque = {};

function popularArrayProdutos(funcao){
    firebase.database().ref("/product").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            arrayProdutos[childSnapshot.key] = childSnapshot.val().name;
        });
        popularArrayQuantidadeProdutos(funcao);
    });
}

function popularArrayQuantidadeProdutos(funcao){
    firebase.database().ref("/productXsector").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            arrayQuantidadeEstoque[childSnapshot.key] = childSnapshot.val().amount;
        });
        popularArrayQuantidadeEstoque(funcao);
    });
}

function popularArrayQuantidadeEstoque(funcao){
    firebase.database().ref("/product").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            arrayQuantidadeProdutos[childSnapshot.key] = childSnapshot.val().amountInStock;
        });
        popularArraySetores(funcao);
    });
}

function popularArraySetores(funcao){
    firebase.database().ref("/sector").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            arraySetores[childSnapshot.key] = childSnapshot.val().name;
        });
        popularTabelaEstoque(funcao);
    });
}

function popularTabelaEstoque(funcao){
    var tabela;
    var linha, col1, col2, col3, col4, col5, col6;
    var i = 0;
    var o;
    tabela = document.getElementById("estoqueTable");

    firebase.database().ref("/productXsector").orderByChild("insertDt").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            linha = tabela.insertRow(++i);
            col1 = linha.insertCell(0);
            col2 = linha.insertCell(1);
            col3 = linha.insertCell(2);
            col4 = linha.insertCell(3);
            col5 = linha.insertCell(4);
            linha.insertCell(5);

            if(funcao == '1')
                col6 = linha.insertCell(6);

            col1.innerHTML = arrayProdutos[childSnapshot.val().productId];
            col2.innerHTML = arraySetores[childSnapshot.val().sectorId];
            var date = childSnapshot.val().insertDt.toString();
            date = date.substring(6,8) + '/' + date.substring(4,6) + '/' +  date.substring(0,4) ;
            col3.innerHTML = date;
            if(childSnapshot.val().expirationDate != null)
            {
                date = childSnapshot.val().expirationDate.toString();
                date = date.substring(6,8) + '/' + date.substring(4,6) + '/' +  date.substring(0,4) ;
            }
            else
            {
                date = 'Não perecível';
            }
            col4.innerHTML = date;
            col5.innerHTML = childSnapshot.val().amount;
            if(funcao == '1')
                col6.innerHTML = '<img src="../../img/remove.png" style="width:100%; padding-top:3px; cursor:pointer; display:block; margin:auto" title="Remover" onclick="removerEstoque(\'' + childSnapshot.key + '\')" />';
        });
    });

    popularAddEstoqueModal();
}

function popularAddEstoqueModal(){
    var select = document.getElementById('txtProdAddEstoqueModal');
    var option;

    for(i in arrayProdutos)
    {
        option = document.createElement("option");
        option.value = i;
        option.text = arrayProdutos[i];
        select.add(option);
    }

    select = document.getElementById('txtSectorAddEstoqueModal');

    for(i in arraySetores)
    {
        option = document.createElement("option");
        option.value = i;
        option.text = arraySetores[i];
        select.add(option);
    }
}

function adicionarProdutoEstoque(){
    var txtProd = document.getElementById('txtProdAddEstoqueModal');
    var txtSector = document.getElementById('txtSectorAddEstoqueModal');
    var txtDataE = document.getElementById('txtDateEAddEstoqueModal').value;
    var txtDateV = document.getElementById('txtDateVAddEstoqueModal').value;
    var txtQtde = document.getElementById('txtQtdeAddEstoqueModal').value;
    var DataI;
    var DataV;
    var dataIobj;
    var dataVobj;
    var diffDays;

    if(txtDateE != ''){
      DataI = txtDataE.substring(0,4) + txtDataE.substring(5,7) + txtDataE.substring(8,10);
      dataIobj = new Date(DataI);
      DataI = parseInt(DataI);
    }

    if(txtDateV != ''){
      DataV = txtDataV.substring(0,4) + txtDataV.substring(5,7) + txtDataV.substring(8,10);
      dataVobj = new Date(DataV);
    }

    if(dataIobj != null && dataVobj != null){
      var timeDiff = dataIobj.getTime() - dataVobj.getTime();
      diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    if(txtProd.options[txtProd.selectedIndex].value == '0' || txtSector.options[txtSector.selectedIndex].value == '0' || txtDataE == '' || txtQtde == ''){
        alert("O produto, setor, data de inserção e quantidade são obrigatórios!");
    } else if(diffDays != null && diffDays < 0){
        alert("A data de validade não pode ser anterior à data de inserção!");
    } else {
        if(txtDateV != '')
        {
            DataV = txtDateV.substring(0,4) + txtDateV.substring(5,7) + txtDateV.substring(8,10);
            DataV = parseInt(DataV);
            firebase.database().ref().child('productXsector').push().set({
                productId: txtProd.options[txtProd.selectedIndex].value,
                sectorId: txtSector.options[txtSector.selectedIndex].value,
                expirationDate: DataV,
                insertDt: DataI,
                amount: parseInt(txtQtde)
            });
        }
        else
        {
            firebase.database().ref().child('productXsector').push().set({
                productId: txtProd.options[txtProd.selectedIndex].value,
                sectorId: txtSector.options[txtSector.selectedIndex].value,
                insertDt: DataI,
                amount: parseInt(txtQtde)
            });
        }

        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
              var today = new Date();
              var dd = today.getDate();
              var mm = today.getMonth()+1;
              var yyyy = today.getFullYear();
              if(dd < 10)
                dd = '0' + dd.toString();
              if(mm < 10)
                mm = '0' + mm.toString();
              var data = yyyy.toString() + mm.toString() + dd.toString();
              firebase.database().ref().child('historico').push().set({
                  action: 'insert_storage',
                  actionDate: parseInt(data),
                  productName: arrayProdutos[txtProd.options[txtProd.selectedIndex].value],
                  quant: parseInt(txtQtde),
                  sectorName: arraySetores[txtSector.options[txtSector.selectedIndex].value],
                  userMail: user.email,
              });
          } else {
            // No user is signed in.
          }
        });

        var ref = firebase.database().ref("/product/" + txtProd.options[txtProd.selectedIndex].value);
        var total = arrayQuantidadeProdutos[txtProd.options[txtProd.selectedIndex].value] + parseInt(txtQtde);
        ref.child('amountInStock').set(total);
        alert("Produto inserido com sucesso no estoque!");
        fecharAddEstoqueModal();
        location.reload();
    }
}

function fecharAddEstoqueModal(){
    var modal = document.getElementById('addModal');
    var txtProd = document.getElementById('txtProdAddEstoqueModal');
    var txtSector = document.getElementById('txtSectorAddEstoqueModal');
    var txtDataE = document.getElementById('txtDateEAddEstoqueModal');
    var txtDateV = document.getElementById('txtDateVAddEstoqueModal');
    var txtQtde = document.getElementById('txtQtdeAddEstoqueModal');

    txtDataE.value = "";
    txtDateV.value = "";
    txtQtde.value = "";
    modal.style.display = "none";
}

function removerEstoque(id){
    var amount;
    var idLabel = document.getElementById('idRemove');
    var idLabelEstoque = document.getElementById('idRemoveEstoque');
    var idSetor = document.getElementById('idSetor');
    idLabel.value = id;

    firebase.database().ref("/productXsector").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if(childSnapshot.key == id)
            {
                idLabelEstoque.value = childSnapshot.val().productId;
                idSetor.value = childSnapshot.val().sectorId;

                var list = document.getElementById("txtQtdeRemoveModal");
                var length = list.options.length;
                for (i = list.options.length-1; i >= 0; i--) {
                  list.remove(i);
                }

                amount = childSnapshot.val().amount;

                var select = document.getElementById('txtQtdeRemoveModal');
                var option;

                option = document.createElement("option");
                option.value = 0;
                option.text = "Selecione...";
                select.add(option);

                for(i = 1; i <= amount; i++)
                {
                    option = document.createElement("option");
                    option.value = i;
                    option.text = i;
                    select.add(option);
                }

                var modal = document.getElementById('editModal');

                modal.style.display = "block";
            }
        });
    });
}

function confirmarRemocaoEstoque(){
    var idLabel = document.getElementById('idRemove').value;
    var idLabelEstoque = document.getElementById('idRemoveEstoque').value;
    var idSetor = document.getElementById('idSetor').value;

    var qtde = document.getElementById("txtQtdeRemoveModal").value;

    if(qtde != 0)
    {
        if (confirm("Você tem certeza que deseja deletar esse(s) produto(s) do estoque?") == true)
        {
            var ref = firebase.database().ref("/productXsector/" + idLabel);
            var total = arrayQuantidadeEstoque[idLabel] - parseInt(qtde);
            ref.child('amount').set(total);

            if(total == 0)
            {
                firebase.database().ref("/productXsector/" + idLabel).remove()
                .then(function(){

                }).catch(function(error) {

                });
            }

            firebase.auth().onAuthStateChanged(function(user) {
              if (user) {
                  var today = new Date();
                  var dd = today.getDate();
                  var mm = today.getMonth()+1;
                  var yyyy = today.getFullYear();
                  if(dd < 10)
                    dd = '0' + dd.toString();
                  if(mm < 10)
                    mm = '0' + mm.toString();
                  var data = yyyy.toString() + mm.toString() + dd.toString();
                  firebase.database().ref().child('historico').push().set({
                      action: 'remove_storage',
                      actionDate: parseInt(data),
                      productName: arrayProdutos[idLabelEstoque],
                      quant: parseInt(qtde),
                      sectorName: arraySetores[idSetor],
                      userMail: user.email,
                  });
              } else {
                // No user is signed in.
              }
            });

            ref = firebase.database().ref("/product/" + idLabelEstoque);
            total = arrayQuantidadeProdutos[idLabelEstoque] - parseInt(qtde);
            ref.child('amountInStock').set(total);

            alert("Remoção efetuada com sucesso!");

            var modal = document.getElementById('editModal');

            modal.style.display = "none";

            location.reload();
        }
    }
    else
    {
        alert('Selecione a quantidade!');
    }
}
function fecharRemoveEstoqueModal(){
    var modal = document.getElementById('editModal');

    modal.style.display = "none";
}
