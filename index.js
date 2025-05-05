document.addEventListener('alpine:init', () => {
    Alpine.store('notifier', {
        email: '',
        isInvalid: false,
        successful: false,
        systemFailure: false,
        isProcessing: false,
        btnText: 'Submit',

        async signThemUp() {
            const isValid = this.validateEmail();
            this.isInvalid = !isValid;
            if (isValid) {
                this.btnText = 'Sending';
                this.isProcessing = true;
                const success = await this.attemptSignup();
                this.isProcessing = false;
                if (success) {
                    this.btnText = 'Sent';
                    this.successful = true;
                    this.systemFailure = false;
                    this.email = '';
                } else {
                    this.btnText = 'failed'
                    this.systemFailure = true;
                }
            }

        },

        validateEmail() {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return isValid.test(this.email);
        },

        async attemptSignup() {

            const token = document.querySelector('[name="cf-turnstile-response"]').value;

            const url = 'https://ln-worker.judah-ddd.workers.dev/validate-captcha-token'
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    email: this.email,
                    isFullInfo: false
                })
            })

            const returnable = await response.json()
            console.log(returnable)
            return returnable;
            
        },

    });

    Alpine.store('sign', {
        email: '',
        phone: '',
        userFirstName: '',
        userLastName: '',
        userTopics: ['General'],
        userTimeRange: 'weekly',
        userHasConsented: false,
        isInvalidEmail: false,
        isInvalidPhone: false,
        successful: false,
        systemFailure: false,
        isProcessing: false,
        btnText: 'Submit',
        stringTopics: '',

        async signThemUp() {
            this.userTopics.forEach((element) => {
                this.stringTopics = this.stringTopics + ' ' + element
            });
            console.log(this.stringTopics)

            const isValidEmail = this.validateEmail();
            this.isInvalidEmail = !isValidEmail;
            this.phone = this.normalizePhoneNumber();
            console.log(this.phone)
            this.isInvalidPhone = this.phone === false;
            if (this.userTopics.length === 0) {
                alert('please select at least one topic')
                return
            }

            if (isValidEmail && this.phone !== false) {
                this.btnText = 'Sending';
                this.isProcessing = true;
                const success = await this.attemptSignup();
                this.isProcessing = false;
                if (success) {
                    this.btnText = 'Sent';
                    this.successful = true;
                    this.systemFailure = false;
                    this.email = '';
                } else {
                    this.btnText = 'failed'
                    this.systemFailure = true;
                }
            } else {
                alert('please add necessary personal information')
            }

        },

        validateEmail() {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return isValid.test(this.email);
        },

        normalizePhoneNumber() {
            const numArray = this.phone.split('');
            const digits = /^[0-9]$/;
            let stringNum = ''
            for (const item in numArray) {
                if (digits.test(numArray[item])) {
                    stringNum = stringNum + numArray[item]
                }
            }
            if (stringNum.length === 10) {
                stringNum = '+1' + stringNum;
                return stringNum
            } else if (stringNum.length === 11) {
                stringNum = '+' + stringNum;
                return stringNum
            } else {
                return false;
            }
        },

        async attemptSignup() {

            const token = document.querySelector('[name="cf-turnstile-response"]').value;

            const url = 'https://ln-worker.judah-ddd.workers.dev/validate-captcha-token'
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    email: this.email,
                    isFullInfo: true,
                    personName: `${this.userFirstName} ${this.userLastName}`,
                    phoneNumber: this.phone,
                    topics: this.stringTopics,
                    frequency: this.userTimeRange,
                    consent: this.userHasConsented
                })
            })

            return await response.json()
            
        }
    });
})
