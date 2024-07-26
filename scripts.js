
    const calendarInput = document.getElementById('calendar');
    const bookButton = document.getElementById('book');
    const clearButton = document.getElementById('clear');

    let bookedDates = []; // Array to hold booked dates

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth()+1);

    const calendarPicker = flatpickr(calendarInput, {
        inline: true,
        mode: "range",
        dateFormat: "Y-m-d",
        locale: 'th',
        minDate: today.toISOString().split('T')[0], // Start from today
        maxDate: nextMonth.toISOString().split('T')[0], // End at the same date next month
        disable: [],
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const date = dayElem.dateObj;
            let isStayDate = false;

            // Apply custom styles based on booked dates
            bookedDates.forEach(([checkinDate, checkoutDate]) => {
                if (date.getTime() === checkinDate.getTime()) {
                    dayElem.classList.add('check-in');
                    isStayDate = false;
                } else if (date.getTime() === checkoutDate.getTime()) {
                    dayElem.classList.add('check-out');
                    isStayDate = false;
                } else if (date > checkinDate && date < checkoutDate) {
                    dayElem.classList.add('disabled');
                    isStayDate = true;
                }
            });

            // Prevent click if it's a stay date
            if (isStayDate) {
                dayElem.classList.add('no-click');
            }
        },
        onChange: function(selectedDates) {
            const clickedDateElem = document.querySelector('.flatpickr-day.selected');
            if (clickedDateElem && clickedDateElem.classList.contains ('check-in')){
                console.log ('Checkin Date: Do nothing');
                calendarPicker.clear(); // ล้างการเลือก
                return null;
            }

            if (selectedDates.length > 0) {
                const startDate = selectedDates[0];
                const endDate = selectedDates[1] || startDate; // ใช้ startDate ถ้า endDate ยังไม่ได้เลือก
                calendarPicker.set('minDate', startDate);

                console.log(`Start Date: ${startDate.toDateString()}, End Date: ${endDate.toDateString()}`);

                const nextCheckInElem = findNextCheckIn(clickedDateElem);
                console.log (nextCheckInElem);
                if (nextCheckInElem){
                    const dayDate = nextCheckInElem.dateObj || new Date(nextCheckInElem.getAttribute('aria-label'));
                    console.log("Next check-in: ", dayDate); 
                    
                    // ตั้งค่า maxDate
                    calendarPicker.set('maxDate', dayDate);
                }

            }
            updateCalendar();
        }
    });

    function updateCalendar() {
        calendarPicker.redraw();
    }

    function bookDates() {
        const selectedDates = calendarPicker.selectedDates;
        console.log('Booking dates:', selectedDates); // Add logging for debugging
        if (selectedDates.length === 2) {
            bookedDates.push([selectedDates[0], selectedDates[1]]);
            console.log('Booked dates array:', bookedDates); // Add logging for debugging
            updateCalendar();
        } else {
            showMessage('กรุณาเลือกวันที่ให้ครบช่วงก่อนกดจอง', 'error'); // แสดงข้อความเมื่อไม่ได้เลือกวันที่ครบ
        }
        clearDates();
    }

    function findNextCheckIn(startElem) {
        if (!startElem)
          return null;
        let nextDateElem = startElem.nextElementSibling;
        while (nextDateElem) {
            if (nextDateElem.classList.contains('check-in')) {
                return nextDateElem;
            }
            nextDateElem = nextDateElem.nextElementSibling;
        }
        return null;
    }

    function clearDates() {
        calendarPicker.clear();
        // อัปเดต minDate และ maxDate
        calendarPicker.set('minDate', today);
        calendarPicker.set('maxDate', nextMonth);
        updateCalendar();
    }

    function showMessage(message, type) {
        const messageElem = document.querySelector('.messages p');
        const messagesDiv = document.querySelector('.messages');
        
        // ล้างคลาสก่อนหน้า
        messagesDiv.classList.remove('success', 'error');
    
        // เพิ่มคลาสตามประเภท
        if (type === 'success') {
            messagesDiv.classList.add('success');
        } else if (type === 'error') {
            messagesDiv.classList.add('error');
        }
        
        // ตั้งค่าข้อความ
        messageElem.textContent = message;
        messagesDiv.style.display = 'block'; // แสดง div
    
        // ซ่อน div หลังจาก 3 วินาที
        setTimeout(() => {
            messagesDiv.style.display = 'none';
        }, 3000);
    }

    bookButton.addEventListener('click', bookDates);
    clearButton.addEventListener('click', clearDates);

