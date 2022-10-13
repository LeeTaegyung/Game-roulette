(() => {

    function Roulette({
        target,
        wheelSize = 300,
        pinPosition = 'top',
        startBtn,
        resetBtn,
        wheelImage,
        itemLength,
        itemInfo,
        animate = {duration: undefined, spins: undefined, easing: undefined}
    }) {
        this.coin = true;
        this.target = document.querySelector(target); // target
        this.canvas = this.target.querySelector('canvas'); // target 기준 자식 canvas 저장
        this.ctx = this.canvas.getContext('2d');
        this.wheelSize = +wheelSize; // 룰렛사이즈 저장
        this.pinPosition = pinPosition; // 룰렛 핀 위치 및 시작점 저장
        this.startBtn = document.querySelector(startBtn);
        this.resetBtn = document.querySelector(resetBtn);
        this.itemLength = itemLength;
        this.itemInfo = itemInfo; // 룰렛 조각 정보(text, value, bg ...)
        this.pieceInfo = [];
        this.animate = animate;

        // wheelImage 있으면 넣어주기
        if(wheelImage) {
            this.wheelImage = new Image();
            this.wheelImage.src = wheelImage; // 전체 룰렛 이미지 경로
        }

        this.setPieceInfo();
        this.createTool();
        this.drawRoulette();

    }
    Roulette.prototype.setPieceInfo = function() {
        const pinVal = {
            top: -90,
            right: 0,
            bottom: 90,
            left: 180,
        }
        let degStart = pinVal[this.pinPosition];
        let ratioTotal = 0;

        // 비율 저장
        for(let i = 0; i < this.itemLength; i++) {
            this.pieceInfo[i] ? this.pieceInfo[i] : this.pieceInfo[i] = {};

            // 비율 담기(균등분배 default)
            this.pieceInfo[i].value = 100 / this.itemLength;
            
            if(this.itemInfo) {
                // 비율 지정값 있으면 담기
                if(this.itemInfo[i].value) {
                    this.pieceInfo[i].value = +this.itemInfo[i].value;
                }
                // 텍스트값 저장
                this.pieceInfo[i].txt = this.itemInfo[i].text;
                // 배경값 있으면 저장
                if(this.itemInfo[i].fillStyle) {
                    this.pieceInfo[i].fillStyle = this.itemInfo[i].fillStyle;
                } else {
                    this.pieceInfo[i].fillStyle = 'transparent';
                }
                // 배경이미지 있으면 저장
                if(this.itemInfo[i].image) {
                    this.pieceInfo[i].image = new Image();
                    this.pieceInfo[i].image.src = this.itemInfo[i].image;
                }

            } else {
                // 입력 안했을때 100을 기준으로 균등분배
                // this.pieceInfo[i].value = 100 / this.itemLength;
                // 배경값 없으면 랜덤배경값 저장
                if(!this.wheelImage) {
                    this.pieceInfo[i].fillStyle = `rgba(${Math.floor((Math.random() * 255 - 1) + 1)}, ${Math.floor((Math.random() * 255 - 1) + 1)}, ${Math.floor((Math.random() * 255 - 1) + 1)}, 1)`;
                }
                
            }
    
            // 비율 전체값 저장
            ratioTotal += this.pieceInfo[i].value;
            
            // 비율 범위 누적하여 저장(각도가 끝나는 값을 알기 위해)
            this.pieceInfo[i].ratioAcc = ratioTotal;
            
        }

        this.pieceInfo.forEach((ele, idx) => {
            // 전체중에 비율이 얼마나 되는지 저장
            ele.ratio = ele.ratioAcc / ratioTotal * 100;
            
            // 일반각 저장
            ele.degStart = degStart;
            ele.degEnd = ele.ratio * 360 / 100 + pinVal[this.pinPosition];
            degStart = ele.degEnd;

            // 호도각 저장
            ele.radianStart = ele.degStart * Math.PI / 180;
            ele.radianEnd = ele.degEnd * Math.PI / 180;

            // 랜덤 숫자 법위 저장
            ele.rangeStart = ele.degStart - pinVal[this.pinPosition];
            ele.rangeEnd = ele.degEnd - pinVal[this.pinPosition];

        })

    }
    Roulette.prototype.createTool = function() {
        // arrow
        let startBtn = this.startBtn;
        let resetBtn = this.resetBtn;
        const arrow = document.createElement('span');
        arrow.classList.add('roulette_arrow', this.pinPosition);
        this.target.appendChild(arrow);

        // start
        if(!startBtn) {
            startBtn = document.createElement('button');
            startBtn.innerText = 'Start';
            this.target.parentNode.appendChild(startBtn);
            startBtn.classList.add('start');
        }
        startBtn.addEventListener('click', () => {
            this.playRoulette();
        })

        // reset
        if(!resetBtn) {
            resetBtn = document.createElement('button');
            resetBtn.innerText = 'Reset';
            this.target.parentNode.appendChild(resetBtn);
            resetBtn.classList.add('reset');
        }
        resetBtn.addEventListener('click', () => {
            this.resetRoulette();
        })
    }
    Roulette.prototype.drawRoulette = function() {
        
        if(this.ctx) {
            const canvas = this.canvas;
            const ctx = this.ctx;
            const startX = this.wheelSize / 2;
            const startY = this.wheelSize / 2;
            const radius = Math.min(startX, startY);

            canvas.width = this.wheelSize;
            canvas.height = this.wheelSize;

            if(this.wheelImage) {
                this.wheelImage.addEventListener('load', () => {
                    ctx.drawImage(this.wheelImage, 0, 0, canvas.width, canvas.height);
                })
            }
            // 룰렛 피스 그리기
            for(let i = 0; i < this.pieceInfo.length; i++) {
                
                if(this.pieceInfo[i].fillStyle) {
                    ctx.fillStyle = this.pieceInfo[i].fillStyle;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.arc(startX, startY, radius, this.pieceInfo[i].radianStart, this.pieceInfo[i].radianEnd);
                    ctx.fill();
                    ctx.closePath();
                }
    
                if(this.pieceInfo[i].image) {
                    this.pieceInfo[i].image.addEventListener('load', () => {
                        ctx.save();
                        ctx.translate(startX, startY);
                        ctx.rotate((this.pieceInfo[i].radianEnd + (this.pieceInfo[i].radianStart - this.pieceInfo[i].radianEnd) / 2) + (90 * Math.PI / 180));
                        ctx.translate(-startX, -startY);
                        ctx.drawImage(this.pieceInfo[i].image, startX - this.pieceInfo[i].image.width/2, 0);
                        ctx.restore();
                    })
                }
                
            }
        }

    }
    Roulette.prototype.resetRoulette = function() {
        this.coin = true;
        this.canvas.style.transform = 'rotate(0deg)';
    }
    Roulette.prototype.getPieceIdx = function() {
        const randomNum = Math.floor(Math.random() * (this.pieceInfo[this.pieceInfo.length - 1].degEnd - this.pieceInfo[0].degStart)) + this.pieceInfo[0].degStart;
        let pickIdx;
        console.log('당첨 랜덤 번호 : ' + randomNum);
        this.pieceInfo.forEach((ele, idx) => {
            if(ele.degStart <= randomNum && ele.degEnd > randomNum) {
                pickIdx = idx;
            }
        })
        console.log('pickIdx : ' + pickIdx);
        return pickIdx;
    }
    Roulette.prototype.playRoulette = function() {
        if(this.coin) {
            this.coin = false;
            const rotateSt = (this.animate.spins || Math.floor(Math.random() * (15 - 10) + 10)) * 360;
            const winningIdx = this.getPieceIdx();
            const winningMinDeg = this.pieceInfo[winningIdx].rangeStart + 5;
            const winningMaxDeg = this.pieceInfo[winningIdx].rangeEnd - 5;
            const winningDeg = Math.floor(Math.random() * (winningMaxDeg - winningMinDeg) + winningMinDeg);
            const rotateDeg = rotateSt + winningDeg;

            this.animation(rotateDeg, winningIdx);

        }
    }
    Roulette.prototype.animation = function(rotateDeg, winningIdx) {
        const easingFunc = {
            easeInQuad: function (t, b, c, d) {
                return c*(t/=d)*t + b;
            },
            easeInOutQuad: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            },
            easeOutCubic: function(t, b, c, d) {
                t /= d;
                t--;
                return c*(t*t*t + 1) + b;
            },
        }
        const canvas = this.canvas;
        const duration = this.animate.duration || 5;
        const fps = 60;
        const start = 0;
        const finish = rotateDeg;
        let easingVal = this.animate.easing || 'easeOutCubic';
        let position = start;
        let time = 0;
        const handler = setInterval(() => {
            time += 1 / fps;
            position = easingFunc[easingVal](time, start, finish, duration);
            if(position >= finish) {
                clearInterval(handler);
                canvas.style.transform = `rotate(-${finish}deg)`;
                return;
            }
            canvas.style.transform = `rotate(-${position}deg)`;
        }, 1000/fps);

        if(this.itemInfo) {
            // 당첨결과 안내 팝업
            setTimeout(() => {
                document.querySelector('.result_pop').classList.add('show');
                document.querySelector('.result_txt').innerHTML = this.pieceInfo[winningIdx].txt;
    
                setTimeout(() => {
                    document.querySelector('.result_pop').classList.remove('show');
                    document.querySelector('.result_txt').innerHTML = '';
                }, 3000)
    
            }, duration * 1000)
        }

        console.log(this.animate);


    }

    const roulette = new Roulette({
        target: '.roulette',
        wheelSize: '300',
        pinPosition: 'top',
        startBtn: '.start_custom',
        itemLength: 8,
        itemInfo: [
            {text: '5만원 적립금', value: '', image: 'img/1.png',},
            {text: '10% 할인쿠폰', value: '', image: 'img/2.png',},
            {text: '꽝!', value: '', image: 'img/3.png',},
            {text: '사은품 증정', value: '', image: 'img/4.png',},
            {text: '7% 할인쿠폰', value: '', image: 'img/5.png',},
            {text: '2만원 적립금', value: '', image: 'img/6.png',},
            {text: '사은품 증정', value: '', image: 'img/7.png',},
            {text: '꽝!', value: '', image: 'img/8.png',},
        ],
        animate: {
            spins: 30,
            duration: 1,
            // easing: 'easeInOutQuad'
        },
    })



})();