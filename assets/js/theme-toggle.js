const themeToggle = document.getElementById("theme-toggle");

const currentTheme = localStorage.getItem("theme") || "light" ;

document.documentElement.setAttribute('data-theme',currentTheme);

themeToggle.addEventListener('click' , () => 
{
    const newTheme = document.documentElement.getAttribute('data-theme') === 'light'?'dark':'light';

    document.documentElement.setAttribute('data-theme',newTheme);

    localStorage.setItem('theme',newTheme);
});