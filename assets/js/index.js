const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const playlist =$('.playlist');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn =$('.btn-toggle-play');
const player =$('.player');
const progress = $('#progress');
const nextBtn =$('.btn-next');
const prevBtn =$('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY')) || {},
    songs:[
        { 
            name: 'Polish Cow Full Version',
            singer: 'だんだんちゃん',
            path: 'https://i1.sndcdn.com/artworks-NrGgIoe2rJtrVzfg-Ctglow-t500x500.jpg',
            music: './assets/music/Polish Cow Full Version.mp3'
        },
        { 
            name: 'La La La - Naughty Boy cover',
            singer: 'Jasmine Thompson',
            path: 'https://i1.sndcdn.com/artworks-000050206799-x4ztfl-t500x500.jpg',
            music: './assets/music/La La La - Naughty Boy cover.mp3'
        },
        { 
            name: '【Sakana】少女レイ/Shoujo Rei【歌ってみた】',
            singer: 'Shoujo Rei',
            path: 'https://i1.sndcdn.com/artworks-rNF2AV0zdwojKapG-6Rw2ng-t500x500.jpg',
            music: './assets/music/【Sakana】少女レイ_Shoujo Rei【歌ってみた】.mp3'
        },
        { 
            name: 'K.K. Slider Crusin Cover',
            singer: 'EeSea',
            path: 'https://i1.sndcdn.com/artworks-isk5qiRGgkyUYgpH-FPLAgw-t500x500.jpg',
            music: './assets/music/K.K. Slider Crusin Cover.mp3'
        },
        { 
            name: 'Boombastic',
            singer: 'DiRealShaggy',
            path: 'https://i1.sndcdn.com/artworks-000094674351-wijkjj-t500x500.jpg',
            music: './assets/music/Boombastic.mp3'
        }
    ],
    setconfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem('PLAYER_STORAGE_KEY', JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div data-index="${index}" class="song ${index === this.currentIndex ? 'active' : ''}">
                    <div class="thumb" style="background-image: url('${song.path}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        //Xử lý cd quay/dừng
        const cdThumdAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ],{
            duration: 10000,
            iterations: Infinity
        });

        cdThumdAnimate.pause();


        //Xử lý phóng to / thu nhỏ cd
        document.onscroll = function() {
            const scollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth/cdWidth;
        };
        //Xử lý nút play
        playBtn.onclick = function() {
            if(_this.isPlaying){
                audio.pause();
            }else{
                audio.play();
            }
        };
        //Khi song play
        audio.onplay = function(){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumdAnimate.play();
        };
        //Khi song pause
        audio.onpause = function(){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumdAnimate.pause();
        };
        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
            
        };
        //Xử lý khi tua song
        progress.oninput = function(e){
            const seekTime = audio.duration/100 * e.target.value;
            audio.currentTime = seekTime;
        };
        //Khi next song
        nextBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };
        //Khi prev song
        prevBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        };
        //Xử lý bật tắt random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setconfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
            
        };
        //Xử lý khi bài hát kết thúc
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            } else {
                nextBtn.click();
            }
        };
        //Xử lý phát lập lại song
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            _this.setconfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        };
        //Xử lý click vào playlist song
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')){
                //Xử lý khi click vào song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurentSong();
                    _this.render()
                    audio.play();
                    
                }
                //Xử lý khi click vào option
                if(e.target.closest('.option')){
                   
                }

            }
        };
    },
    loadCurentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.path}')`;
        audio.src = this.currentSong.music;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurentSong();
    },
    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurentSong();
    },
    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'nearest'
            });
        },300)
    },
    start: function() {
        //Gán cấu hình config
        this.loadConfig();


        //Định nghĩa các thuộc tính
        this.defineProperties();


        //Lắng nghe sự kiện
        this.handleEvents();
        

        //Tải bài hát đầu tiên
        this.loadCurentSong()


        //Render playlist
        this.render();

        
        //Hiển thị trạng thái ban đầu của btn repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
};

app.start();