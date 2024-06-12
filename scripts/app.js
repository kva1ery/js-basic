'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */

const page = {
    menu: document.querySelector('.menu__list'),
    header: {
        text: document.querySelector('.header__text'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar')
    },
    content: {
        daysContainer: document.querySelector('.days'),
        nextDay: document.querySelector('.habbit-add-day')
    },
    popup: {
        index: document.querySelector('#add-habbit-popup'),
        form:  document.querySelector('#add-habbit-popup .popup__form'),
    }
}

/* utils */

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
    if (page.popup.index.classList.contains('cover_hidden')) {
        page.popup.index.classList.remove('cover_hidden');
    } else {
        page.popup.index.classList.add('cover_hidden');
    }
}

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
}

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const result = {};

    let isValid = true;
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
            isValid = false;
        }

        result[field] = fieldValue;
    }

    return isValid ? result : undefined;
}

/* render */

function rerenderMenu(activeHabbit) {
    for (const habbit of habbits) {
        const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
        if (!existed) {
            const element = document.createElement('button');
            element.setAttribute('menu-habbit-id', habbit.id);
            element.classList.add('menu__item');
            element.innerHTML = `<img src="images/icons/${habbit.icon}.svg" alt="${habbit.name}">`;

            if (activeHabbit.id === habbit.id) {
                element.classList.add('menu__item_active');
            }

            element.addEventListener('click', () => rerender(habbit.id));

            page.menu.appendChild(element);
            continue;
        }
        
        if (activeHabbit.id === habbit.id) {
            existed.classList.add('menu__item_active');
        } else {
            existed.classList.remove('menu__item_active');
        }
    }
}

function rerenderHead(activeHabbit) {
    page.header.text.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1 
        ? 100 
        : activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressPercent.innerHTML = `${progress.toFixed(0)}%`;
    page.header.progressCoverBar.style.width = `${progress.toFixed(0)}%`;
}

function rerenderContent(activeHabbit) {
    page.content.daysContainer.innerHTML = '';
        for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `
        <div class="habbit__day">День ${Number(index) +1}</div>
        <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
        <button class="habbit__delete" onclick="deleteDay(${index})">
            <img src="images/icons/delete.svg" alt="Удалить день ${Number(index) +1}">
        </button>`;
        page.content.daysContainer.appendChild(element);
    }

    page.content.nextDay.querySelector('.habbit__day').innerText = 'День ' + (activeHabbit.days.length + 1);
}

function rerender(activeHabbitId) {

    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if (!activeHabbit) {
        return;
    }
    globalActiveHabbitId = activeHabbitId;

    rerenderMenu(activeHabbit);
    rerenderHead(activeHabbit);
    rerenderContent(activeHabbit);

    document.location.replace(document.location.pathname + '#' + activeHabbitId);
}

/* work with days */

function addDay(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['comment']);
    if (!data) {
        return;
    }

    const habbit = habbits.find(habbit => habbit.id === globalActiveHabbitId);
    if (habbit) {
        habbit.days.push({ comment: data.comment });
        rerender(globalActiveHabbitId);
        saveData();
    }

    resetForm(event.target, ['comment']);
}

function deleteDay(dayIndex) {
    if (!dayIndex) {
        return
    }
    const habbit = habbits.find(habbit => habbit.id === globalActiveHabbitId);
    if (habbit && dayIndex < habbit.days.length) {
        habbit.days.splice(dayIndex, 1);
        rerender(globalActiveHabbitId);
        saveData();
    }
}

/* work with habbits */
function setIcon(context, icon) {
    const iconField = page.popup.form.querySelector('input[name="icon"]');
    iconField.value = icon;
    const activeIcon = page.popup.index.querySelector('.icon-select__icon_active');
    activeIcon.classList.remove('icon-select__icon_active');

    context.classList.add('icon-select__icon_active');
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateAndGetFormData(event.target, ['icon', 'name', 'target']);
    if (!data) {
        return;
    }

    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
    habbits.push({
        id: maxId + 1,
        icon: data.icon,
        name: data.name,
        target: data.target,
        days: []
    });
    resetForm(event.target, ['name', 'target']);
    togglePopup();
    saveData();
    rerender(maxId + 1);
}

/* init */

(() => {
    loadData();
    if (habbits.length > 0) {
        const hashId = Number(document.location.hash.replace('#', ''));
        const urlHabbit = habbits.find(habbit => habbit.id === hashId);
        if (urlHabbit) {
            rerender(urlHabbit.id);    
        } else {
            rerender(habbits[0].id);    
        }
    }
})();
