var Login = function() {

    $(window).keydown(function(event){
    if(event.keyCode == 13) {
      event.preventDefault();
      return false;
    }
	});

    var handleForgetPassword = function() {

        jQuery('#forget-password').click(function() {
            jQuery('.login-form').hide();
            jQuery('.forget-form').show();
			clearLoginForm();
        });

        jQuery('#back-btn').click(function() {
			clearForgotForm();
        });
    }


    return {
        //main function to initiate the module
        init: function() {
            handleForgetPassword();
            handleRegister();
        }

    };

}();

function validateUserAndPass() {
	var user = document.getElementById("username").value;
	var pass = document.getElementById("password").value;

	if(user == '')
	{
		jQuery('#lblUserNameLogin').show();
	}
	else
	{
		jQuery('#lblUserNameLogin').hide();
	}
	if(pass == '')
	{
		jQuery('#lblPassLogin').show();
	}
	else
	{
		jQuery('#lblPassLogin').hide();
	}
	if(user != '' && pass != '')
	{
		firebase.auth().signInWithEmailAndPassword(user, pass)
		.then(function(firebaseUser){
			clearLoginForm();
			firebase.database().ref("/user").orderByChild("mail").equalTo(user).on("value", function(snapshot) {
				snapshot.forEach(function(childSnapshot) {
					funcao = childSnapshot.val().permissionType;
					if(funcao == 1)
					{
						window.location.href = 'html/coordenador/inicio.html';
					}
					else if(funcao == 0)
					{
						window.location.href = 'html/estagiario/inicio.html';
					}
					else if(funcao == 2)
					{
						alert("Usuário bloqueado!");
					}
				});
			});
		}).catch(function(error){
			var errorCode = error.code;
			if(errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-email')
			{
				alert('O email ou a senha estão incorretos!');
			}
		});
	}
}

function signUpUser() {
	var name = document.getElementById("nameSignUp").value;
	var phone = document.getElementById("phoneSignUp").value;
	var category = document.getElementById("categorySignUp");
	var user = document.getElementById("usernameSignUp").value;
	var pass = document.getElementById("passwordSignUp").value;
	var pass2 = document.getElementById("retypePasswordSignUp").value;
	var flag = true;
	var categoryNumber, categoryName;

	if(name.length < 10)
	{
		if(name == '')
		{
			jQuery('#lblNameSignUp').show();
			jQuery('#lblMinNameSignUp').hide();
		}
		else
		{
			jQuery('#lblMinNameSignUp').show();
			jQuery('#lblNameSignUp').hide();
		}
		flag = false;
	}
	else
	{
		jQuery('#lblMinNameSignUp').hide();
		jQuery('#lblNameSignUp').hide();
		flag = true;
	}
	if(phone == '')
	{
		jQuery('#lblPhoneSignUp').show();
		flag = false;
	}
	else
	{
		jQuery('#lblPhoneSignUp').hide();
		flag = true;
	}
	if(category.options[category.selectedIndex].value == '1')
	{
		jQuery('#lblCategorySignUp').show();
		flag = false;
	}
	else
	{
		jQuery('#lblCategorySignUp').hide();
		flag = true;
	}
	if (user == '')
	{
		jQuery('#lblUserNameSignUp').show();
		flag = false;
	}
	else
	{
		jQuery('#lblUserNameSignUp').hide();
		flag = true;
	}
	if(pass == '')
	{
		jQuery('#lblPassSignUp').show();
		flag = false;
	}
	else if(pass2 == '')
	{
		jQuery('#lblPass2SignUp').show();
		jQuery('#lblPassSignUp').hide();
		jQuery('#lblDifPasswordsSignUp').hide();
		flag = false;
	}
	else if(pass != pass2)
	{
		jQuery('#lblDifPasswordsSignUp').show();
		jQuery('#lblPassSignUp').hide();
		jQuery('#lblPass2SignUp').hide();
		flag = false;
	}
	else
	{
		jQuery('#lblPassSignUp').hide();
		jQuery('#lblPass2SignUp').hide();
		jQuery('#lblDifPasswordsSignUp').hide();
		flag = true;
	}

	if(category.options[category.selectedIndex].value == '2')
	{
		categoryNumber = 1;
		categoryName = 'Administrador';
	}
	if(category.options[category.selectedIndex].value == '3')
	{
		categoryNumber = 0;
		categoryName = 'Estagiário';
	}

	if(flag == true)
	{
		firebase.auth().createUserWithEmailAndPassword(user, pass)
		.then(function(firebaseUser){
			firebase.database().ref().child('user').push().set({
				name: name,
				mail: user,
				permissionType: categoryNumber,
				phone: phone,
				role: categoryName,
			});
			alert('O usuário foi cadastrado com sucesso!');
			clearSignUpForm();
		}).catch(function(error){
			var errorCode = error.code;
			console.log(errorCode);
			if(errorCode === 'auth/email-already-in-use')
			{
				alert("O email já está cadastrado!");
			}
			else if(errorCode === 'auth/weak-password')
			{
				alert("A senha está muito fraca!");
			}
		});
	}
}

function clearSignUpForm() {
	document.getElementById('register-form').reset();
	jQuery('#lblMinNameSignUp').hide();
	jQuery('#lblNameSignUp').hide();
	jQuery('#lblPhoneSignUp').hide();
	jQuery('#lblCategorySignUp').hide();
	jQuery('#lblUserNameSignUp').hide();
	jQuery('#lblPassSignUp').hide();
	jQuery('#lblDifPasswordsSignUp').hide();
	jQuery('#lblPass2SignUp').hide();
	jQuery('.register-form').hide();
	jQuery('.login-form').show();
}

function clearForgotForm() {
	jQuery('#lblUserNameForgot').hide();
	jQuery('#lblUserNotFoundForgot').hide();
	document.getElementById('emailForgot').value = '';
	jQuery('.login-form').show();
    jQuery('.forget-form').hide();
}

function clearLoginForm() {
	document.getElementById('login-form').reset();
	jQuery('#lblUserNameLogin').hide();
	jQuery('#lblPassLogin').hide();
}

function sendForgotEmail() {
	var mail = document.getElementById('emailForgot').value;

	if(mail === '')
	{
		jQuery('#lblUserNotFoundForgot').hide();
		jQuery('#lblUserNameForgot').show();
	}
	else
	{
		firebase.auth().sendPasswordResetEmail(mail).then(function() {
			clearForgotForm();
			alert("Email de redefinição de senha enviado!");
			document.getElementById('emailForgot').value = '';
		}, function(error) {
			jQuery('#lblUserNameForgot').hide();
			jQuery('#lblUserNotFoundForgot').show();
		});
	}
}
