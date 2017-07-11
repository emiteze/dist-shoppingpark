var arrayProdutos = {};
var arraySetores = {};
var arrayQuantidadeProdutos = {};
var arrayQuantidadeEstoque = {};

function popularArrayProdutos(){
    firebase.database().ref("/product").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            arrayProdutos[childSnapshot.key] = childSnapshot.val().name;
        });
        popularArrayQuantidadeProdutos();
    });
}

function popularArrayQuantidadeProdutos(){
    firebase.database().ref("/productXsector").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            arrayQuantidadeEstoque[childSnapshot.key] = childSnapshot.val().amount;
        });
        popularArrayQuantidadeEstoque();
    });
}

function popularArrayQuantidadeEstoque(){
    firebase.database().ref("/product").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            arrayQuantidadeProdutos[childSnapshot.key] = childSnapshot.val().amountInStock;
        });
        popularArraySetores();
    });
}

function popularArraySetores(){
    firebase.database().ref("/sector").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            arraySetores[childSnapshot.key] = childSnapshot.val().name;
        });
        popularSelects();
    });
}

function popularSelects(){
    var select = document.getElementById('filtroProduto');
    var option;

    for(i in arrayProdutos)
    {
        option = document.createElement("option");
        option.value = i;
        option.text = arrayProdutos[i];
        select.add(option);
    }

    select = document.getElementById('filtroSetor');

    for(i in arraySetores)
    {
        option = document.createElement("option");
        option.value = i;
        option.text = arraySetores[i];
        select.add(option);
    }
}

function gerarRelatorioOperacoes(){
    var pdf = new jsPDF(), margin=0.5,verticalOffset=margin;
    pdf.setFontStyle('bold');
    pdf.text(60, 20, 'Relatório de Operações Realizadas');
    pdf.setFontSize(10);
    pdf.setFontStyle('normal');
    var i = 45, j = 1, page = 1;;
    firebase.database().ref("/historico").orderByChild("actionDate").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var n = "";
            var operacao, prep;
            var data = childSnapshot.val().actionDate.toString();
            data = data.substring(6,8) + '/' + data.substring(4,6) + '/' + data.substring(0,4);
            if(childSnapshot.val().action == 'insert_storage')
            {
                operacao = 'inseriu'
                prep = 'no';
            }
            else if(childSnapshot.val().action == 'remove_storage')
            {
                operacao = 'removeu'
                prep = 'do';
            }
            n = 'O usuário ' + childSnapshot.val().userMail + ' ' + operacao + ' ' + childSnapshot.val().quant
                + ' ' + childSnapshot.val().productName + '(s) ' + prep + ' setor ' + childSnapshot.val().sectorName
                + ' em ' + data + '.';
            var split = pdf.splitTextToSize(n, 240);
            pdf.text(10, i, split);
            i += 10;
            j++;
            if(page == 1)
            {
                if(j == 22)
                {
                    pdf.addPage();
                    j = 1;
                    i = 15;
                    page++;
                }
            }
            else
            {
                if(j == 24)
                {
                    pdf.addPage();
                    j = 1;
                    i = 15;
                }
            }
        });
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        var hh = today.getHours();
        var min = today.getMinutes();
        if(min < 10)
          min = '0' + mm.toString();
        if(dd < 10)
          dd = '0' + dd.toString();
        if(mm < 10)
          mm = '0' + mm.toString();
        var data = 'Gerado em: ' + dd.toString() + '/' + mm.toString() + '/' + yyyy.toString() + ' às ' + hh.toString() + ':' + min.toString();
        pdf.text(150, i, data);
        pdf.save('Relatorio_Operações.pdf');
    });
}

function gerarRelatorioEstoqueTotal(){
    var pdf = new jsPDF(), margin=0.5,verticalOffset=margin;
    pdf.setFontStyle('bold');
    pdf.text(70, 20, 'Relatório de Estoque');
    pdf.setFontSize(10);
    pdf.setFontStyle('normal');
    var i = 45, j = 1, page = 1;
    firebase.database().ref("/productXsector").orderByChild("productId").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var n = "";
            n = 'Produto: ' + arrayProdutos[childSnapshot.val().productId];
            pdf.text(10, i, n);
            i += 5;
            n = 'Setor: ' + arraySetores[childSnapshot.val().sectorId];
            pdf.text(10, i, n);
            i += 5;
            var data = childSnapshot.val().insertDt.toString();
            data = data.substring(6,8) + '/' + data.substring(4,6) + '/' + data.substring(0,4);
            n = 'Data de Inserção: ' + data;
            pdf.text(10, i, n);
            i += 5;
            if(childSnapshot.val().expirationDate != null && childSnapshot.val().expirationDate != '')
            {
                data = childSnapshot.val().expirationDate.toString();
                data = data.substring(6,8) + '/' + data.substring(4,6) + '/' + data.substring(0,4);
                n = 'Data de Vencimento: ' + data;
                pdf.text(10, i, n);
                i += 5;
            }
            n = 'Quantidade em Estoque: ' + childSnapshot.val().amount;
            pdf.text(10, i, n);
            i += 10;
            j++;
            if(page == 1)
            {
                if(j == 9)
                {
                    pdf.addPage();
                    j = 1;
                    i = 15;
                    page++;
                }
            }
            else
            {
                if(j == 10)
                {
                    pdf.addPage();
                    j = 1;
                    i = 15;
                }
            }
        });
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        var hh = today.getHours();
        var min = today.getMinutes();
        if(min < 10)
          min = '0' + mm.toString();
        if(dd < 10)
          dd = '0' + dd.toString();
        if(mm < 10)
          mm = '0' + mm.toString();
        var data = 'Gerado em: ' + dd.toString() + '/' + mm.toString() + '/' + yyyy.toString() + ' às ' + hh.toString() + ':' + min.toString();
        pdf.text(150, i, data);
        pdf.save('Relatorio_Estoque.pdf');
    });
}

function gerarRelatorioProdutos(){
    var pdf = new jsPDF(), margin=0.5,verticalOffset=margin;
    pdf.setFontStyle('bold');
    pdf.text(70, 20, 'Relatório de Produtos');
    pdf.setFontSize(10);
    pdf.setFontStyle('normal');
    var i = 45, j = 1, page = 1;
    firebase.database().ref("/product").orderByChild("name").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var n = "";
            n = 'Produto: ' + childSnapshot.val().name;
            pdf.text(10, i, n);
            i += 5;
            n = 'Tipo: ' + childSnapshot.val().type;
            pdf.text(10, i, n);
            i += 5;
            n = 'Fabricante: ' + childSnapshot.val().manufacturer;
            pdf.text(10, i, n);
            i += 5;
            n = 'Estoque Mínimo: ' + childSnapshot.val().minimumStock;
            pdf.text(10, i, n);
            i += 5;
            if(childSnapshot.val().amountInStock < childSnapshot.val().minimumStock)
            {
                pdf.setTextColor(255, 0, 0);
            }
            n = 'Quantidade em Estoque: ' + childSnapshot.val().amountInStock;
            pdf.text(10, i, n);
            i += 10;
            j++;
            pdf.setTextColor('black');
            if(page == 1)
            {
                if(j == 9)
                {
                    pdf.addPage();
                    j = 1;
                    i = 15;
                    page++;
                }
            }
            else
            {
                if(j == 10)
                {
                    pdf.addPage();
                    j = 1;
                    i = 15;
                }
            }
        });
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();
        var hh = today.getHours();
        var min = today.getMinutes();
        if(min < 10)
          min = '0' + mm.toString();
        if(dd < 10)
          dd = '0' + dd.toString();
        if(mm < 10)
          mm = '0' + mm.toString();
        var data = 'Gerado em: ' + dd.toString() + '/' + mm.toString() + '/' + yyyy.toString() + ' às ' + hh.toString() + ':' + min.toString();
        pdf.text(150, i, data);
        pdf.save('Relatorio_Produtos.pdf');
    });
}

function gerarRelatorioEstoqueFiltrado(filtro)
{
    var tipoFiltro;

    if(filtro == 1)
    {
        tipoFiltro = document.getElementById('filtroProduto');
        if(tipoFiltro.options[tipoFiltro.selectedIndex].value == '0')
        {
            alert('Selecione um produto!');
        }
        else
        {
            var pdf = new jsPDF(), margin=0.5,verticalOffset=margin;
            pdf.setFontStyle('bold');
            pdf.text(70, 20, 'Relatório de Estoque');
            pdf.setFontSize(10);
            pdf.setFontStyle('normal');
            var i = 45, j = 1, page = 1, aux = 1;
            firebase.database().ref("/productXsector").orderByChild("insertDt").on("value", function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    if(childSnapshot.val().productId == tipoFiltro.options[tipoFiltro.selectedIndex].value)
                    {
                        var n = "";
                        if(aux == 1)
                        {
                            pdf.setFontStyle('bold');
                            pdf.setFontSize(12);
                            n = 'Produto: ' + arrayProdutos[childSnapshot.val().productId];
                            pdf.text(10, i, n);
                            i += 10;
                            aux++;
                            pdf.setFontSize(10);
                            pdf.setFontStyle('normal');
                        }
                        n = 'Setor: ' + arraySetores[childSnapshot.val().sectorId];
                        pdf.text(10, i, n);
                        i += 5;
                        var data = childSnapshot.val().insertDt.toString();
                        data = data.substring(6,8) + '/' + data.substring(4,6) + '/' + data.substring(0,4);
                        n = 'Data de Inserção: ' + data;
                        pdf.text(10, i, n);
                        i += 5;
                        if(childSnapshot.val().expirationDate != null && childSnapshot.val().expirationDate != '')
                        {
                            data = childSnapshot.val().expirationDate.toString();
                            data = data.substring(6,8) + '/' + data.substring(4,6) + '/' + data.substring(0,4);
                            n = 'Data de Vencimento: ' + data;
                            pdf.text(10, i, n);
                            i += 5;
                        }
                        n = 'Quantidade em Estoque: ' + childSnapshot.val().amount;
                        pdf.text(10, i, n);
                        i += 10;
                        j++;
                        if(page == 1)
                        {
                            if(j == 9)
                            {
                                pdf.addPage();
                                j = 1;
                                i = 15;
                                page++;
                            }
                        }
                        else
                        {
                            if(j == 10)
                            {
                                pdf.addPage();
                                j = 1;
                                i = 15;
                            }
                        }
                    }
                });
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1;
                var yyyy = today.getFullYear();
                var hh = today.getHours();
                var min = today.getMinutes();
                if(min < 10)
                  min = '0' + mm.toString();
                if(dd < 10)
                  dd = '0' + dd.toString();
                if(mm < 10)
                  mm = '0' + mm.toString();
                var data = 'Gerado em: ' + dd.toString() + '/' + mm.toString() + '/' + yyyy.toString() + ' às ' + hh.toString() + ':' + min.toString();
                pdf.text(150, i, data);
                pdf.save('Relatorio_Estoque_Prod.pdf');
            });
        }
    }
    else if(filtro == 2)
    {
        tipoFiltro = document.getElementById('filtroSetor');
        if(tipoFiltro.options[tipoFiltro.selectedIndex].value == '0')
        {
            alert('Selecione um setor!');
        }
        else
        {
            var pdf = new jsPDF(), margin=0.5,verticalOffset=margin;
            pdf.setFontStyle('bold');
            pdf.text(70, 20, 'Relatório de Estoque');
            pdf.setFontSize(10);
            pdf.setFontStyle('normal');
            var i = 45, j = 1, page = 1, aux = 1;
            firebase.database().ref("/productXsector").orderByChild("productId").on("value", function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    if(childSnapshot.val().sectorId == tipoFiltro.options[tipoFiltro.selectedIndex].value)
                    {
                        var n = "";
                        if(aux == 1)
                        {
                            pdf.setFontStyle('bold');
                            pdf.setFontSize(12);
                            n = 'Setor: ' + arraySetores[childSnapshot.val().sectorId];
                            pdf.text(10, i, n);
                            i += 10;
                            aux++;
                            pdf.setFontSize(10);
                            pdf.setFontStyle('normal');
                        }
                        n = 'Produto: ' + arrayProdutos[childSnapshot.val().productId];
                        pdf.text(10, i, n);
                        i += 5;
                        var data = childSnapshot.val().insertDt.toString();
                        data = data.substring(6,8) + '/' + data.substring(4,6) + '/' + data.substring(0,4);
                        n = 'Data de Inserção: ' + data;
                        pdf.text(10, i, n);
                        i += 5;
                        if(childSnapshot.val().expirationDate != null && childSnapshot.val().expirationDate != '')
                        {
                            data = childSnapshot.val().expirationDate.toString();
                            data = data.substring(6,8) + '/' + data.substring(4,6) + '/' + data.substring(0,4);
                            n = 'Data de Vencimento: ' + data;
                            pdf.text(10, i, n);
                            i += 5;
                        }
                        n = 'Quantidade em Estoque: ' + childSnapshot.val().amount;
                        pdf.text(10, i, n);
                        i += 10;
                        j++;
                        if(page == 1)
                        {
                            if(j == 9)
                            {
                                pdf.addPage();
                                j = 1;
                                i = 15;
                                page++;
                            }
                        }
                        else
                        {
                            if(j == 10)
                            {
                                pdf.addPage();
                                j = 1;
                                i = 15;
                            }
                        }
                    }
                });
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth()+1;
                var yyyy = today.getFullYear();
                var hh = today.getHours();
                var min = today.getMinutes();
                if(min < 10)
                  min = '0' + mm.toString();
                if(dd < 10)
                  dd = '0' + dd.toString();
                if(mm < 10)
                  mm = '0' + mm.toString();
                var data = 'Gerado em: ' + dd.toString() + '/' + mm.toString() + '/' + yyyy.toString() + ' às ' + hh.toString() + ':' + min.toString();
                pdf.text(150, i, data);
                pdf.save('Relatorio_Estoque_Setor.pdf');
            });
        }
    }
}
