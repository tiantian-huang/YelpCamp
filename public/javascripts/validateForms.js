// 1. We can configure the Express framework to 'serve' files, like the EJS files, that automatically served if they're in the views directory, but also static assets (images, CSS and JS files to be used in the client-side), that is, to make them available to the client-side user. Express by default serves static assets in the public directory.
// 2. Static files are the website content that won't be changed, mainly images, JavaScript files (that, ironically, can be used to dynamically change the HTML content), CSS files. Yes, they can be cached, that is, stored in the browser if we configure our website that way, so that, after being loaded for the first time, there's no need for the browser to redownload everything if the user access that webpage again. With that, subsequent accesses can be faster since the cached files may be used instead.
// 3. To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.  app.use(express.static('public'));

(function () {
    'use strict'

    bsCustomFileInput.init()//Bs-custom-file-input 上传文件时使用

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()
