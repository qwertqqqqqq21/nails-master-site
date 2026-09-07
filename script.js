// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let bookingData = {
    service: null,
    date: null,
    time: null,
    name: null,
    phone: null,
    telegram: null,
    comment: null
};

// ===== URL Google Apps Script =====
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwZ5EoR-YaFa1GIIlqvHxMYF9t6-pkm_fj_86xwmt1C7oJ2y1sBTPA-_trja0xm_CEB/exec';

// ===== НАВИГАЦИЯ =====
function scrollToBooking() {
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
}

function nextStep(step) {
    if (!validateStep(step - 1)) return;
    
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function prevStep(step) {
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep(step) {
    if (step === 1) {
        const selectedService = document.querySelector('input[name="service"]:checked');
        if (!selectedService) {
            alert('Пожалуйста, выберите услугу');
            return false;
        }
        bookingData.service = selectedService.value;
        return true;
    }
    
    if (step === 2) {
        const date = document.getElementById('booking-date').value;
        const selectedTime = document.querySelector('.time-slot.selected');
        
        if (!date) {
            alert('Пожалуйста, выберите дату');
            return false;
        }
        if (!selectedTime) {
            alert('Пожалуйста, выберите время');
            return false;
        }
        
        bookingData.date = date;
        bookingData.time = selectedTime.dataset.time;
        return true;
    }
    
    return true;
}

// ===== ОТПРАВКА БРОНИРОВАНИЯ (ИСПРАВЛЕНО) =====
function submitBooking() {
    const name = document.getElementById('client-name').value.trim();
    const phone = document.getElementById('client-phone').value.trim();
    const telegram = document.getElementById('client-telegram').value.trim();
    const comment = document.getElementById('client-comment').value.trim();
    
    if (!name) {
        alert('Пожалуйста, введите ваше имя');
        return;
    }
    if (!phone) {
        alert('Пожалуйста, введите номер телефона');
        return;
    }
    
    const selectedService = document.querySelector('input[name="service"]:checked');
    const selectedTime = document.querySelector('.time-slot.selected');
    const date = document.getElementById('booking-date').value;

    const finalBookingData = {
        action: 'newBooking',
        name: name,
        phone: phone,
        telegram: telegram || '',
        service: selectedService ? selectedService.value : '',
        date: date,
        time: selectedTime ? selectedTime.dataset.time : '',
        comment: comment
    };

    console.log('Отправляем данные в Google Script:', finalBookingData);

    const submitBtn = document.querySelector('#step3 .btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Отправка...';
    submitBtn.disabled = true;

    // Отправка данных в Google Apps Script
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Важно для Google Apps Script
        headers: {
            'Content-Type': 'text/plain', // Важно для избежания CORS ошибок
        },
        body: JSON.stringify(finalBookingData)
    })
    .then(() => {
        console.log('Запрос успешно отправлен!');
        
        // Показ модального окна успеха
        const modalText = document.getElementById('modal-text');
        modalText.innerHTML = `
            <strong>Услуга:</strong> ${finalBookingData.service}<br>
            <strong>Дата:</strong> ${formatDate(finalBookingData.date)}<br>
            <strong>Время:</strong> ${finalBookingData.time}<br><br>
            ${finalBookingData.telegram ? 'Напоминания придут в Telegram автоматически.' : 'Мы свяжемся с вами для подтверждения.'}
        `;
        document.getElementById('successModal').classList.add('active');
        
        // Сброс формы
        resetBookingForm();
    })
    .catch(error => {
        console.error('Ошибка отправки:', error);
        alert('Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз или напишите нам в WhatsApp.');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

function resetBookingForm() {
    document.querySelectorAll('input[name="service"]').forEach(input => input.checked = false);
    document.getElementById('booking-date').value = '';
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    document.getElementById('client-name').value = '';
    document.getElementById('client-phone').value = '';
    document.getElementById('client-telegram').value = '';
    document.getElementById('client-comment').value = '';
    
    document.querySelectorAll('.booking-step').forEach(s => s.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
}

function closeModal() {
    document.getElementById('successModal').classList.remove('active');
}

// ===== ФИЛЬТРАЦИЯ ПОРТФОЛИО =====
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.dataset.filter;
        
        document.querySelectorAll('.portfolio-item').forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'block';
                item.style.animation = 'fadeIn 0.5s';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// ===== ВЫБОР ВРЕМЕНИ =====
document.querySelectorAll('.time-slot').forEach(slot => {
    slot.addEventListener('click', function() {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// ===== LIGHTBOX (Просмотр фото) =====
function openLightbox(imageSrc, caption) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox active';
    lightbox.innerHTML = `
        <button class="lightbox-close" onclick="closeLightbox()">×</button>
        <img src="${imageSrc}" alt="${caption}">
        ${caption ? `<div class="lightbox-caption">${caption}</div>` : ''}
    `;
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            closeLightbox();
        }
    });
    
    document.body.appendChild(lightbox);
    
    document.addEventListener('keydown', function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', closeOnEscape);
        }
    });
}

function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        lightbox.remove();
    }
}

document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('click', function() {
        const img = this.querySelector('img');
        const category = this.dataset.category;
        const captions = {
            'french': 'Классический френч',
            'geometry': 'Геометрический дизайн',
            'minimalism': 'Минимализм',
            'bright': 'Яркий дизайн'
        };
        openLightbox(img.src, captions[category] || 'Работа мастера');
    });
});

// ===== МОБИЛЬНОЕ МЕНЮ =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
}

function closeMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.remove('active');
}

document.addEventListener('click', function(event) {
    const menu = document.getElementById('mobileMenu');
    const burger = document.querySelector('.burger');
    
    if (menu && burger && !menu.contains(event.target) && !burger.contains(event.target)) {
        closeMobileMenu();
    }
});

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                closeMobileMenu();
            }
        });
    });
    
    console.log('✅ Сайт загружен и готов к работе!');
});