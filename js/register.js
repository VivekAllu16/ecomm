const PW=/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
$('#f').onsubmit=async e=>{e.preventDefault();const m=$('#m'),v=id=>$('#'+id).value.trim();
  if(!PW.test($('#password').value))return showMsg(m,'Password needs 8+ characters with an uppercase letter, a number and a special character.');
  if($('#password').value!==$('#confirmPassword').value)return showMsg(m,'Passwords do not match.');
  if(!/^\d{10}$/.test(v('phoneNo')))return showMsg(m,'Enter a 10-digit phone number.');
  try{await api('/api/users/register',{method:'POST',body:{name:v('name'),email:v('email'),password:$('#password').value,confirmPassword:$('#confirmPassword').value,phoneNo:v('phoneNo'),securityQuestionId:+$('#securityQuestionId').value,securityAnswer:v('securityAnswer')}});
    showMsg(m,'Account created. Redirecting to login…',true);setTimeout(()=>location.href='login.html',1200)}catch(x){showMsg(m,x.message)}};
