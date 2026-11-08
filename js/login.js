if(token())location.href='index.html';
$('#f').onsubmit=async e=>{e.preventDefault();
  try{const r=await api('/api/users/login',{method:'POST',body:{email:$('#email').value.trim(),password:$('#password').value}});
    localStorage.setItem('token',r.token);localStorage.setItem('user',JSON.stringify({id:r.userId,name:r.name,email:r.email}));
    location.href=new URLSearchParams(location.search).get('next')||'index.html'}catch(x){showMsg($('#m'),x.message)}};
