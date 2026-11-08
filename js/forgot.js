const S={},m=$('#form-message'),go=n=>{['email','security','reset'].forEach(s=>$('#'+s+'-section').style.display=s===n?'block':'none');m.textContent=''};
$('#verify-email-btn').onclick=()=>{const e=$('#email').value.trim();if(!/^\S+@\S+\.\S+$/.test(e))return showMsg(m,'Enter a valid email address.');S.email=e;go('security')};
$('#verify-answer-btn').onclick=()=>{const a=$('#security-answer').value.trim();if(!a)return showMsg(m,'Enter your answer.');S.q=$('#security-question').value;S.a=a;go('reset')};
$('#reset-password-btn').onclick=async()=>{const p=$('#new-password').value;
  if(p!==$('#confirm-password').value)return showMsg(m,'Passwords do not match.');
  if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(p))return showMsg(m,'Password needs 8+ characters with an uppercase letter, a number and a special character.');
  try{await api('/api/users/ForgotPassword',{method:'POST',body:{email:S.email,securityQuestionId:S.q,securityAnswer:S.a,newPassword:p,confirmPassword:p}});
    showMsg(m,'Password updated. Redirecting to login…',true);setTimeout(()=>location.href='login.html',1500)}
  catch(x){showMsg(m,x.message);go('email')}};
