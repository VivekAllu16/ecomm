// Redirect to the home page if the user is already logged in
if (token()) {
    location.href = 'index.html';
}

// Handle login form submission
$('#f').onsubmit = async e => {
    e.preventDefault();

    try {
        const r = await api('/api/users/login', {
            method: 'POST',
            body: {
                email: $('#email').value.trim(),
                password: $('#password').value
            }
        });

        // Store authentication details
        localStorage.setItem('token', r.token);
        localStorage.setItem('user', JSON.stringify({
            id: r.userId,
            name: r.name,
            email: r.email
        }));

        // Redirect to the requested page or home page
        location.href = new URLSearchParams(location.search).get('next') || 'index.html';

    } catch (x) {
        showMsg($('#m'), x.message);
    }
};