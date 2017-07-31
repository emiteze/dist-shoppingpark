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
        window.location.href = '../../index.html';
    }, function(error) {
        alert("Erro!" + error);
    });
}

function listaNomeUsuario(callback) {
  var userName = "";
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          firebase.database().ref("/user").orderByChild("mail").equalTo(user.email).on("value", function(snapshot) {
              snapshot.forEach(function(childSnapshot) {
                userName = JSON.stringify(childSnapshot);
              });
              callback(userName);
          });
      }
    });
}

function verificaAlertasEPreencheHTML(){

	verificaQuantidadeMinima(function(callbackResponse){
    var minimumQuantityArray = callbackResponse;
    verificaValidadeProxima(function(callbackResponse){
      var nearValityArray = callbackResponse;
      listaNomeUsuario(function(callBackResponse){
        var userName = "";
        if(callBackResponse){
          userName = JSON.parse(callBackResponse).name;
        }

        if(minimumQuantityArray.length > 0 && nearValityArray.length > 0){

          document.getElementById("user-have-alerts").classList.remove("hide-div");
          document.getElementById("user-have-alerts").classList.add("show-div");
          document.getElementById("welcome-name").innerHTML = "Bem vindo, " + userName.toString();

          if(minimumQuantityArray.length > 0){
            document.getElementById("minimum-stock-div").classList.remove("hide-div");
            document.getElementById("minimum-stock-div").classList.add("show-div");
            var ul = document.getElementById("minimum-stock-list");
            minimumQuantityArray.forEach(function(item, index){
              var li = document.createElement("li");
              li.appendChild(document.createTextNode("O produto " + item.name + " da fornecedora " + item.manufacturer + " está com a quantidade em estoque (" + item.amountInStock + ") abaixo da quantidade mínima (" + item.minimumStock + ")"));
              ul.appendChild(li);
            });
          }

          if(nearValityArray.length > 0){
            document.getElementById("near-vality-div").classList.remove("hide-div");
            document.getElementById("near-vality-div").classList.add("show-div");
            var ul = document.getElementById("near-vality-list");
            var li = document.createElement("li");
            nearValityArray.forEach(function(item, index){
              var auxDate = item.expirationDate.toString();
              var productExpirationDate = new Date(auxDate.substring(0,4),(parseInt(auxDate.substring(4,6)) - 1),auxDate.substring(6,8));
              var li = document.createElement("li");
              li.appendChild(document.createTextNode("O produto " + item.name + " da fornecedora " + item.manufacturer + " está dentro do período de alerta (" + item.expirationAlert + " dias). Validade do produto: (" + (productExpirationDate.getDate() < 10 ? '0' + productExpirationDate.getDate() : productExpirationDate.getDate()) + "/" +
                                                    ((productExpirationDate.getMonth() + 1) < 10 ? '0' + (productExpirationDate.getMonth() + 1) : (productExpirationDate.getMonth() + 1)) + "/" + productExpirationDate.getFullYear() + ")"));
              ul.appendChild(li);
            });
          }

        } else {
          document.getElementById("user-dont-have-alerts").classList.remove("hide-div");
          document.getElementById("user-dont-have-alerts").classList.add("show-div");
          document.getElementById("welcome-name").innerHTML = "Bem vindo, " + userName.toString();
        }

      });
    });
  });

}

function verificaQuantidadeMinima(callback){

  var minimumQuantityArray = []

   firebase.database().ref("/product").orderByChild("name").on("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
          if(childSnapshot.val().amountInStock < childSnapshot.val().minimumStock) {
              minimumQuantityArray.push(childSnapshot.val());
          }
      });
      callback(minimumQuantityArray);
    });

}

function verificaValidadeProxima(callback){

  var today = new Date();
  var productDate;
  var nearValityArray = []
  var productsArray = new Map();

  firebase.database().ref("/product").orderByChild("name").on("value", function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
          productsArray.set(childSnapshot.key, childSnapshot.val());
      });
      firebase.database().ref("/productXsector").orderByChild("insertDt").on("value", function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
              productsArray.forEach(function(item, key){
                  if(childSnapshot.val().productId == key){
                    var productExpirationAlert = item['expirationAlert'];
                    var auxDate = childSnapshot.val().expirationDate;
                    if(auxDate != null && auxDate != ''){
                      auxDate = auxDate.toString();
                      productDate = new Date(auxDate.substring(0,4),(parseInt(auxDate.substring(4,6)) - 1),auxDate.substring(6,8));
                      var timeDiff = Math.abs(productDate.getTime() - today.getTime());
                      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                      if(diffDays < productExpirationAlert){
                        var productobject = JSON.parse(JSON.stringify(item));
                        productobject['expirationDate'] = childSnapshot.val().expirationDate;
                        nearValityArray.push(productobject);
                      }
                    }
                  }
              });
          });
          callback(nearValityArray);
      });
  });

}
