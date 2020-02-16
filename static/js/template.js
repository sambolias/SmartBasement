var notificationQueue = [];
var isDark = true;

function peekNotification()
{
    if(notificationQueue.length == 0) return;
    return notificationQueue[0];
}

function dequeueNotification()
{
    if(notificationQueue.length == 0) return;
    return notificationQueue.shift();
}

function showNextToast()
{
    var n = peekNotification();
    if(n)
    {
        var toasts = document.getElementsByClassName("toast");
        for(var i = toasts.length-1; i >= 0; i--)
        {
            if(!toasts[i].classList.contains('active'))
            {
                toasts[i].lastElementChild.innerHTML = n;
                toasts[i].classList.add('active');
                showToasts();
                dequeueNotification();
                break;
            }
        }
    }
}

function makeInactive(id)
{
    var elt = document.getElementById(id);
    elt.classList.remove('active');
    //slight delay to allow old toast to fade
    new Promise(function(resolve, reject) {
        setTimeout(resolve, 500);
      }).then(function() {
        showNextToast();
      });
}

function showToasts()
{
    $('.toast.active').toast('show');
}

function addNotification(msg)
{
    notificationQueue.push(msg);
    showNextToast();
}

function init_page()
{
    configure_sizing();
    //TODO make theme param
    changeTheme('themed', 'dark');
}

function configure_sizing()
{
    var menu = document.getElementsByClassName('menu')[0];
    var side_menu = document.getElementsByClassName('side_menu')[0];
    var user_bar = document.getElementsByClassName('user_bar')[0];
    var head = document.getElementsByClassName('head')[0];
    var foot = document.getElementsByClassName('foot')[0];
    var content = document.getElementsByClassName('content')[0];
    var icon_menu = document.getElementsByClassName('icon_menu')[0];
    var opts = document.getElementsByClassName('opts')[0];
    var labels = document.getElementsByClassName('labels');

    side_menu.style.paddingTop = menu.offsetHeight + head.offsetHeight + 35 + 'px';
    side_menu.style.left = icon_menu.offsetWidth-1 + 'px';

    icon_menu.style.paddingTop += head.offsetHeight + 10 + 'px';
    icon_menu.style.paddingBottom += foot.offsetHeight + 'px';

    user_bar.style.paddingTop += head.offsetHeight + 'px';

    content.style.paddingTop += head.offsetHeight + 'px';
    content.style.paddingBottom += foot.offsetHeight + 'px';

    for(var i = 0; i < labels.length; i++)
    {
        labels[i].style.height = opts.offsetHeight + 'px';
    }
}

function toggle_menu()
{
    var elt = document.getElementsByClassName('side_menu')[0];
    var menu = document.getElementById('menu');
    document.removeEventListener("click", clickEvt, true);

    if(elt.classList.contains('open'))
    {
            elt.classList.remove('open');
            menu.classList.remove('open');
    }
    else 
    { 
        elt.classList.add('open');
        menu.classList.add('open');
        document.addEventListener("click", clickEvt, true);
    }

}
function clickEvt(evt) 
{
    const element = document.getElementById("side_bar");
    const elementm = document.getElementById("menu");
    let targetElement = evt.target; 
    if (targetElement != element && targetElement != elementm) {
        console.log("clicked off");
        toggle_menu();
    }
    else
    {
        console.log("clicked on");
    }
}
function clickEvt2(evt) 
{
    const element = document.getElementById("user_bar");
    const elementm = document.getElementById("settings");
    let targetElement = evt.target; 
    if (targetElement != element && targetElement != elementm && !element.contains(targetElement)) {
        toggle_user_menu();
    }
}

function toggle_user_menu()
{
    var elt = document.getElementsByClassName('user_bar')[0];
    var sett = document.getElementById('settings');
    document.removeEventListener("click", clickEvt2, true);

    if(elt.classList.contains('open'))
    {
            elt.classList.remove('open');
            sett.classList.remove('open');
    }
    else 
    {
        elt.classList.add('open');
        sett.classList.add('open');
        document.addEventListener("click", clickEvt2, true);
    }
}

function toggle_notifications()
{
    var elt = document.getElementsByClassName('toasts')[0];
    var icon = document.getElementById('notifications');
    if(elt.classList.contains('hide'))
    {
        icon.innerHTML = 'notifications_active';
        elt.classList.remove('hide');
    }
    else 
    {
        icon.innerHTML = 'notifications_off';
        elt.classList.add('hide');
    }
}


function changeTheme(origTheme, newTheme)
{
    isDark = newTheme == 'dark';

    let elt = document.getElementsByClassName(origTheme);
    while(elt.length > 0)
    {
        for(var i = 0; i < elt.length; i++)
        {
            elt[i].style.transition = 'all 1s';
            elt[i].classList.add(newTheme);
            elt[i].classList.remove(origTheme);
        }
        elt = document.getElementsByClassName(origTheme);
    }
}